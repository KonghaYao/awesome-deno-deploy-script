const hostPage = (path) => {
    return () => {
        return new Response(
            Deno.readTextFileSync(new URL(path, import.meta.url)),
            {
                headers: {
                    "content-type": "text/html; charset=utf-8",
                },
            }
        );
    };
};
export const OAuth2Page = (app) => {
    return app
        .get("/", hostPage("./pages/login.html"))
        .get("/callback.html", hostPage("./pages/callback.html"));
};
