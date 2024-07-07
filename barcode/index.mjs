import XMLDom from "npm:xmldom";
import JsBarcode from "npm:jsbarcode";
const { DOMImplementation, XMLSerializer } = XMLDom;
const xmlSerializer = new XMLSerializer();
const document = new DOMImplementation().createDocument(
    "http://www.w3.org/1999/xhtml",
    "html",
    null
);

Deno.serve(
    /** @param {Request} req */
    async (req) => {
        const url = new URL(req.url);
        if (url.pathname === "/bar") {
            const options = Object.fromEntries(url.searchParams.entries());
            const svgNode = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );
            JsBarcode(svgNode, options.data, {
                ...options,
                xmlDocument: document,
            });

            const svgText = xmlSerializer.serializeToString(svgNode);
            document.removeChild(svgNode);
            return new Response(svgText, {
                headers: {
                    "Content-Type": "image/svg+xml",
                },
            });
        }

        return new Response("404", { status: 404 });
    }
);
