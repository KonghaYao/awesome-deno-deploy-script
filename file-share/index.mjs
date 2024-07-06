import { Md5 } from "https://deno.land/std@0.95.0/hash/md5.ts";

const UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

Deno.serve(
    /**
     *  接口说明
     * @param {Request} req
     * @returns {Response}
     */
    async (req) => {
        const headers = new Headers();
        headers.set("Access-Control-Allow-Headers", "*");
        headers.set("Access-Control-Allow-Methods", "GET");
        headers.set("Access-Control-Allow-Origin", "*");
        // headers.set("Cache-Control", "public, max-age=1200");

        if (req.method === "POST") {
            // Handle upload request
            const data = await req.blob();
            data.name = "1.txt";
            try {
                const uploaded = await upload(data);
                return new Response(JSON.stringify(uploaded), {
                    status: 200,
                    headers,
                });
            } catch (error) {
                return new Response(error.message, { status: 500, headers });
            }
        } else if (req.method === "GET") {
            // Handle download request
            const url = new URL(req.url);
            const shortUrl = url.searchParams.get("url");
            try {
                return download(shortUrl).then(
                    (res) =>
                        new Response(res.body, {
                            status: 200,
                            headers,
                        })
                );
            } catch (error) {
                return new Response(error.message, { status: 500, headers });
            }
        }

        return new Response("Method not allowed", { status: 405, headers });
    }
);

/**
 * 通过 WeTransfer API下载文件。
 * @param {string} shortened_url - WeTransfer缩短的URL，用于初始化下载过程。
 * @returns {Promise<Response>} - 返回一个Promise，该Promise解析为下载文件的Response对象。
 */
async function download(shortened_url) {
    // 从缩短的URL中提取转移ID和安全哈希
    const res = await fetch(shortened_url).then((res) => {
        const [transfer_id, security_hash] = res.url.split("/").slice(-2);

        // 构建API请求所需的JSON payload
        const j = {
            intent: "entire_transfer",
            security_hash: security_hash,
        };

        // 发起API请求以获取直接下载链接
        return fetch(
            `https://wetransfer.com/api/v4/transfers/${transfer_id}/download`,
            {
                headers: { "content-type": "application/json" },
                method: "post",
                body: JSON.stringify(j),
                "user-agent": UA,
            }
        ).then((res) => res.json());
    });

    // 返回用于实际下载文件的直接链接
    // console.log(res.direct_link);
    return fetch(res.direct_link);
}

/**
 * upload to wetransfer
 * 注意，需要境外服务器访问 wetransfer
 * @param {Blob} file
 */
async function upload(file) {
    const filename = file.name;
    const hash = new Md5().update(await file.arrayBuffer()).toString();
    const transfer = await fetch(
        "https://wetransfer.com/api/v4/transfers/link",
        {
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua":
                    '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-app-origin": "decoupled",
                "User-Agent": UA,
                Referer: "https://wetransfer.com/",
                Origin: "https://wetransfer.com",
                "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://wetransfer.com/",
            referrerPolicy: "origin",
            body: JSON.stringify({
                message: "",
                display_name: filename,
                ui_language: "en",
                domain_user_id: "2eb931a1-2f8f-4bf5-a649-1de732acd839",
                files: [{ name: filename, size: file.size, item_type: "file" }],
                expire_in: 604800,
            }),
            method: "POST",
            mode: "cors",
            credentials: "include",
        }
    ).then((res) => res.json());
    let authorization = transfer.storm_upload_token;
    // console.log("transfer", transfer);
    const urls = JSON.parse(atob(authorization.split(".")[1]));
    // console.log("checked", urls);
    authorization = `Bearer ${authorization}`;
    await fetch(urls["storm.preflight_batch_url"], {
        headers: {
            accept: "application/json",
            "accept-language": "zh-CN,zh;q=0.9",
            authorization,
            "content-type": "application/json",
            "sec-ch-ua":
                '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "User-Agent": UA,
            Referer: "https://wetransfer.com/",
            Origin: "https://wetransfer.com",
            "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://wetransfer.com/",
        referrerPolicy: "origin",
        body: JSON.stringify({
            items: [
                {
                    path: filename,
                    item_type: "file",
                    blocks: [{ content_length: file.size }],
                },
            ],
        }),
        method: "POST",
        mode: "cors",
        credentials: "include",
    }).then(async (res) => {
        if (res.status !== 200) {
            console.error(await res.text());
            throw new Error("preflict");
        }
        return res.blob();
    });
    // console.log('preflict');
    const blocks = await fetch(urls["storm.announce_blocks_url"], {
        headers: {
            accept: "application/json",
            "accept-language": "zh-CN,zh;q=0.9",
            authorization,
            "content-type": "application/json",
            "sec-ch-ua":
                '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
        },
        referrer: "https://wetransfer.com/",
        referrerPolicy: "origin",
        body: JSON.stringify({
            blocks: [{ content_length: file.size, content_md5_hex: hash }],
        }),
        method: "POST",
        mode: "cors",
        credentials: "include",
    }).then((res) => res.json());
    const url = blocks.data.blocks[0].presigned_put_url;
    // console.log('got upload server url');
    await fetch(url, {
        headers: {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
        },
        referrer: "https://wetransfer.com/",
        referrerPolicy: "origin",
        body: null,
        method: "OPTIONS",
        mode: "cors",
        credentials: "omit",
    });
    await fetch(url, {
        headers: {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            ...blocks.data.blocks[0].put_request_headers,
        },
        referrer: "https://wetransfer.com/",
        referrerPolicy: "origin",
        body: file,
        method: "PUT",
        mode: "cors",
        credentials: "omit",
    }).then((res) => {
        // console.log(res.status);
        if (res.status >= 300) {
            throw Error("upload failed");
        }
        return res.blob();
    });
    await new Promise((resolve) => {
        setTimeout(resolve, 3000);
    });
    // console.log('get Callback URL');
    await fetch(urls["storm.create_batch_url"], {
        headers: {
            accept: "application/json",
            "accept-language": "zh-CN,zh;q=0.9",
            authorization,
            "content-type": "application/json",
            "sec-ch-ua":
                '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "x-deadline": "5",
            "x-error-budget": "reqs=15 oks=14 avail=1.00",
        },
        referrer: "https://wetransfer.com/",
        referrerPolicy: "origin",
        body: JSON.stringify({
            items: [
                {
                    path: filename,
                    item_type: "file",
                    block_ids: [blocks.data.blocks[0].block_id],
                },
            ],
        }),
        method: "POST",
        mode: "cors",
        credentials: "include",
    }).then((res) => res.json());
    // console.log(result);
    const finalize = await fetch(
        `https://wetransfer.com/api/v4/transfers/${transfer.id}/finalize`,
        {
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua":
                    '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-app-origin": "decoupled",
                "User-Agent": UA,
                Referer: "https://wetransfer.com/",
                Origin: "https://wetransfer.com",
                "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://wetransfer.com/",
            referrerPolicy: "origin",
            body: '{"wants_storm":true}',
            method: "PUT",
        }
    ).then((res) => res.json());
    // console.log(transfer.id);
    // console.log(finalize);
    return finalize;
}
