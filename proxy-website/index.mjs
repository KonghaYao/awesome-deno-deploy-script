// 代理整个网站，并让其支持 CORS，向 KV 中添加了记录

const HOST = "cloud.appwrite.io";
/** 复制头部 */
const copyHeaders = (headers) => {
    const newHeader = new Headers();
    for (const i of headers.entries()) {
        newHeader.append(...i);
    }
    return newHeader;
};
/** 重写请求头部信息 */
const ReqHeadersRewrite = (req, Url) => {
    const newH = copyHeaders(req.headers);
    newH.delete("X-deno-transparent");
    // 重写 referer 和 origin 保证能够获取到数据
    newH.set("referer", Url.toString());
    newH.set("origin", Url.toString());
    return newH;
};
const ResHeadersReWrite = (res, domain) => {
    const newHeader = copyHeaders(res.headers);
    // newHeader.set("access-control-allow-origin", "*");
    const cookie = newHeader.get("set-cookie");
    cookie &&
        newHeader.set(
            "set-cookie",
            cookie.replace(/domain=(.+?);/, `domain=${domain};`)
        );
    newHeader.delete("X-Frame-Options"); // 防止不准 iframe 嵌套
    return newHeader;
};
/** 代理整个网站，包括所有请求模式 */
const proxy = (host, req) => {
    // const Url = getTransparentURL(req);
    const Url = new URL(req.url);
    Url.host = host;
    if (Url instanceof Response) return Url;
    // console.log(Url.toString());

    const newH = ReqHeadersRewrite(req, Url);
    return fetch(Url, {
        headers: newH,
        method: req.method,
        // 所有 body 将会转交，故没啥兼容问题
        body: req.body,
        redirect: req.redirect,
    }).then((res) => {
        const newHeader = ResHeadersReWrite(res, new URL(req.url).host);
        newHeader.set("access-control-allow-origin", req.headers.get("Origin"));
        const config = {
            status: res.status,
            statusText: res.statusText,
            headers: newHeader,
        };
        console.log(res.status, res.url);
        if (res.status >= 300 && res.status < 400) {
            console.log("重定向至", req.url);
            return Response.redirect(req.url, res.status);
        }
        return new Response(res.body, config);
    });
};
const kv = await Deno.openKv();
async function KVAddOne(keys) {
    const item = await kv.get(keys);
    const res = await kv
        .atomic()
        .check(item)
        .set(keys, (item.value ?? 0) + 1) // 更新发送方的余额。
        .commit();
}

Deno.serve(
    (req) => {
        const Origin = req.headers.get("Origin");
        if (Origin) KVAddOne(["records", "host", Origin]);
        return proxy(HOST, req);
    },
    {
        onError(e) {
            return new Response(JSON.stringify({ error: e, code: 101 }), {
                headers: {
                    "access-control-allow-origin": "*",
                },
            });
        },
    }
);
