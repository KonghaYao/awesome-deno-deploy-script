import { Md5 } from "https://deno.land/std@0.95.0/hash/md5.ts";

Deno.serve(handler);
const kv = await Deno.openKv();

/** 定义短链接的前缀 */
const prefix = "https://localhost:8000/";
/** 定义短链接的长度 */
const shortenLength = 6;

/**
 * 处理HTTP请求的函数
 * @param {Request} req - HTTP请求对象
 * @returns {Response} - HTTP响应对象
 */
async function handler(req) {
    // 解析请求的URL
    const url = new URL(req.url);

    // 判断请求是否为目标接口
    if (url.pathname.startsWith("/api/url-shortener")) {
        // 从请求参数中获取原始URL
        const originUrl = url.searchParams.get("url");
        // 如果没有提供原始URL，返回错误响应
        if (!originUrl) return new Response("url is required", { status: 400 });

        // 生成原始URL的MD5哈希，并截取前n个字符作为短链接
        const hash = new Md5()
            .update(originUrl)
            .toString()
            .slice(0, shortenLength);

        // 将原始URL和短链接存入键值存储
        await kv.set(["url_shortener", hash], originUrl);

        // 返回包含原始URL和短链接的信息
        return new Response(
            JSON.stringify({ originUrl, shorten_url: prefix + hash, hash })
        );
    } else {
        // 从URL路径中提取短链接码
        const hashCode = url.pathname.slice(1);
        // 如果提取到短链接码，并且长度正确
        if (hashCode && hashCode.length === shortenLength) {
            // 从键值存储中获取对应的原始URL
            const item = await kv.get(["url_shortener", hashCode]);
            // 如果找到对应的原始URL，返回重定向响应
            if (item.value) {
                return Response.redirect(item.value, 302);
            }
        }
        // 如果短链接码无效，返回404错误响应
        return new Response("404 Not Found", { status: 404 });
    }
}
