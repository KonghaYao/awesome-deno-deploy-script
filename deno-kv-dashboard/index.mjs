const kv = await Deno.openKv();

const DenoAdmin = async (req, prefix = "/deno-kv", htmlText = "") => {
    const { pathname } = new URL(req.url);
    if (pathname === prefix && htmlText)
        return new Response(htmlText, {
            headers: {
                "content-type": "text/html",
            },
        });
    if (pathname === prefix + "/list") {
        const qs = new URL(req.url).searchParams;
        const entries = kv.list(
            {
                prefix: qs.get("searchKey")
                    ? JSON.parse(qs.get("searchKey"))
                    : [],
            },
            {
                limit: 20,
                start: qs.get("start")
                    ? JSON.parse(qs.get("start"))
                    : undefined,
            }
        );
        const list = [];
        for await (const entry of entries) {
            list.push({
                ...entry,
                value: entry.value.toString(),
                type: Object.prototype.toString.call(entry.value).slice(8, -1),
            });
        }
        return new Response(
            JSON.stringify({
                code: 0,
                data: {
                    list,
                    limit: 20,
                    start: list.length ? list[list.length - 1].key : null,
                    isEnd: list.length === 0,
                },
            })
        );
    }
    if (pathname === prefix + "/set" && req.method === "POST") {
        const body = await req.json();
        await kv.set(body.key, body.value, body.options);
        return new Response(JSON.stringify({ code: 0 }));
    }
    if (pathname === prefix + "/delete") {
        const key = new URL(req.url).searchParams.get("key");
        await kv.delete(JSON.parse(key));
        return new Response(JSON.stringify({ code: 0 }));
    }

    return new Response("Not Found", { status: 404 });
};

Deno.serve(async (req) =>
    DenoAdmin(
        req,
        "/deno-kv",
        await Deno.readTextFile(new URL("./index.html", import.meta.url))
    )
);
