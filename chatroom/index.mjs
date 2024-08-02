import { Sono } from "jsr:@sono/core";
import { loadUrl } from "../load-url/index.ts";
const sono = new Sono();
Deno.serve(
  /**
   * @param {Request} req
   */
  async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      return sono.connect(req);
    }
    return new Response(
      await loadUrl(new URL("./client.html", import.meta.url)),
      { headers: { "content-type": "text/html" } }
    );
  }
);
