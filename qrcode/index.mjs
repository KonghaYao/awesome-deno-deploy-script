import { qr } from "npm:headless-qr";
import jsQR from "npm:jsqr";
import Jimp from "npm:jimp";
Deno.serve(async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/qr") {
        return createQRCode(req);
    }
    if (url.pathname === "/qr-scan") {
        const blob = await req.arrayBuffer();

        // Load the image with Jimp
        const image = await Jimp.read(blob);
        const imageData = {
            data: new Uint8ClampedArray(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height,
        };

        const decodedQR = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
        );

        return new Response(
            JSON.stringify({ code: 0, data: decodedQR?.data }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
    return new Response(
        "GET /qr?url=https://example.com \nPOST /qr-scan Binary File"
    );
});
async function createQRCode(req) {
    const url = new URL(req.url);
    const qs = Object.fromEntries(url.searchParams.entries());
    const qrCode = await qr(qs.url, qs);
    return new Response(qrCode, {
        headers: {
            "Content-Type": "image/png",
        },
    });
}
