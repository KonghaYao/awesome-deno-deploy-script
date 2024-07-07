import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";

Deno.serve(handler);
/**
 * 定义一个常量数组，包含需要检查是否可达的网站URL。
 */
const mySites = ["https://chinese-font.netlify.app/"];

/**
 * 使用Deno的corn函数设置定时任务，每天定时检查网站是否存活。
 * @description 只能在 Deno Deploy 中使用
 * @param {string} taskName - 任务名称。
 * @param {string} cronExpression - cron表达式，用于定义任务的执行周期。
 * @param {Function} callback - 任务执行的回调函数。
 */
Deno.corn("check website alive", "0 0 * * *", checkAlive);

/**
 * 检查所有网站是否可达的异步函数。
 * 该函数通过并发请求每个网站并检查其响应状态来判断网站是否可达。
 */
async function checkAlive() {
    // 如果网站列表为空，则直接返回，不执行任何检查。
    if (!mySites.length) return;

    // 并发请求所有网站，并将结果存储在log数组中。
    const log = await Promise.all(
        mySites.map(async (site) => {
            // 调用isUp函数检查每个网站的可达性。
            return isUp(site);
        })
    ).then((res) => {
        // 处理isUp函数的返回结果，格式化为期望的输出格式。
        return res.map((res) => {
            return {
                url: res.originUrl, // 网站的URL。
                isUp: res.ax_reason === "OK", // 网站是否可达。
            };
        });
    });

    // 打印检查结果，包括时间戳和网站的可达性信息。
    console.log(new Date().toISOString(), "\n", JSON.stringify(log, null, 4));
}

/** 一个检查网站是否正常的服务器
 * @param {Request} req
 */
async function handler(req) {
    const url = new URL(req.url);
    const originUrl = url.searchParams.get("url");
    if (!originUrl) return new Response("请输入url", { status: 400 });
    return new Response(
        JSON.stringify({ code: 0, isUp: await isUp(originUrl) })
    );
}

function isUp(url) {
    const timestamp = Date.now();
    return fetch(
        "https://www.site24x7.com/tools/general/simpleTest.do?ct=" + timestamp,
        {
            headers: {
                accept: "*/*",
                "accept-language": "zh-CN,zh;q=0.9",
                "content-type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                "sec-ch-ua":
                    '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
            },
            referrer:
                "https://www.site24x7.com/tools/check-website-availability.html",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: `method=doWebsiteTest&locationid=1&url=${encodeURIComponent(
                url
            )}&timestamp=${timestamp}&requestId=3`,
            method: "POST",
            mode: "cors",
            credentials: "include",
        }
    )
        .then((res) => res.text())
        .then((res) => {
            const qs = new URLSearchParams(
                Html5Entities.decode(res.trim().slice(1))
            );
            return { originUrl: url, ...Object.fromEntries(qs.entries()) };
        });
}
