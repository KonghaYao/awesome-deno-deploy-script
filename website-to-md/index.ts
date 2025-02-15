import { z } from "https://deno.land/x/zod/mod.ts";
import { Readability } from "https://esm.sh/@mozilla/readability";
import TurndownService from "https://esm.sh/turndown";
import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { decode, encode } from "https://esm.sh/iconv-lite";
const schema = z.object({
    url: z.string().url(),
});

async function extractReadableContent(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const parser = new Readability(doc);
    const article = await parser.parse();
    return article ? article.content : null;
}

async function handleRequest(req: Request): Promise<Response> {
    if (req.method === "POST") {
        let json;
        try {
            json = await req.json();
        } catch (_) {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), {
                status: 400,
            });
        }

        if (!schema.safeParse(json).success) {
            return new Response(JSON.stringify({ error: "Invalid URL" }), {
                status: 400,
            });
        }

        try {
            const res = await fetch(json.url);
            const charset = res.headers
                .get("content-type")
                ?.match(/charset=([^;]+)/)?.[1];
            const htmlText = decodeCharset(await res.arrayBuffer(), charset);
            const readableContent =
                (await extractReadableContent(htmlText)) ?? htmlText;

            const turndownService = new TurndownService({
                headingStyle: "atx",
                codeBlockStyle: "fenced",
            });

            const markdown = turndownService.turndown(readableContent);

            return new Response(markdown, { status: 200 });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
            });
        }
    } else {
        return new Response("Method not allowed", { status: 405 });
    }
}

function decodeCharset(text: ArrayBuffer, charset: string = "utf-8") {
    try {
        return decode(new Uint8Array(text), charset);
    } catch (error) {
        console.error(`Failed to decode text with charset ${charset}:`, error);
        return text;
    }
}

// 创建并启动HTTP服务器
Deno.serve(async (req: Request) => {
    return await handleRequest(req);
});
