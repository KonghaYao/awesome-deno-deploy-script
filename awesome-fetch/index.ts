import makeFetchCookie from "npm:fetch-cookie";
import { randUserAgent } from "npm:@tonyrl/rand-user-agent";

export { randUserAgent };
/**
 * 提供爬虫专用的 fetch 函数，自动随机获取 user-agent
 *  */
export const AwesomeFetch = (fetch: typeof globalThis.fetch) => {
    const fetchWithCookie = makeFetchCookie(fetch);
    const config = {
        agent: randUserAgent("desktop"),
    };
    const newFetch = (
        input: RequestInfo | URL,
        init: RequestInit = {}
    ): Promise<Response> => {
        if (typeof input === "string") {
            input = new URL(input);
        }
        if (init.headers) {
            init.headers = new Headers(init.headers);
            init.headers.set("user-agent", config.agent);
        }
        return fetchWithCookie(input, init);
    };
    return { fetch: newFetch, config };
};
