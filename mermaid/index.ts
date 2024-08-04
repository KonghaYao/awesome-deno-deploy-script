import { loadUrl } from "../load-url/index.ts";
Deno.serve(async (req) => {
    // if (new URL(req.url).pathname === "/test.html") {
    //     return new Response(
    //         await loadUrl(new URL("./test.html", import.meta.url))
    //     );
    // }
    // 只需要 index.html#mermaid代码 encodeURIComponent
    return new Response(
        await loadUrl(new URL("./index.html", import.meta.url)),
        {
            headers: {
                "Content-Type": "text/html",
            },
        }
    );
});
