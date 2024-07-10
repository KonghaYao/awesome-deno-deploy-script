import sharp from "npm:sharp";
import { Duplex } from "node:stream";
const stream = await fetch(
    "https://bitiful-contents.butterix.com/cHJvLTQ/images/aGplFoOknVV6wUe7ByC45Q0p3z8.png"
).then((res) => res.arrayBuffer());
Deno.serve((req) =>
    handle(
        req,
        (path) => {
            console.log(path);
            // 这里替换成你的获取图像的方式
            return new Response(stream, {
                headers: {
                    "content-type": "image/png",
                },
            });
        },
        "/"
    )
);

function getQSNumber(value, isFloat = false) {
    if (typeof value === "string") {
        if (isFloat) {
            return parseFloat(value);
        }
        return parseInt(value);
    }
}

/**
 *
 * @param {Request} req
 * @param {(path: string) => Promise<Response>} getFileStream
 */
async function handle(req, getFileStream, prefix = "/") {
    const url = new URL(req.url);
    const qs = url.searchParams;
    let contentType = undefined;
    if (url.pathname.startsWith(prefix)) {
        let path = url.pathname.slice(prefix.length);
        const toType = qs.get("type");
        if (toType && path.endsWith(toType)) {
            path = path.slice(0, -toType.length - 1);
        }
        let img = sharp();

        if (toType) {
            img = img.toFormat({
                id: toType,
                quality: getQSNumber(qs.get("q")),
            });

            // jpeg png webp gif  avif
            if (toType === "jpeg") {
                contentType = "image/jpeg";
            }
            if (toType === "png") {
                contentType = "image/png";
            }
            if (toType === "webp") {
                contentType = "image/webp";
            }
            if (toType === "gif") {
                contentType = "image/gif";
            }
            if (toType === "avif") {
                contentType = "image/avif";
            }
        }
        const resize = {};
        if (qs.get("w")) resize.width = getQSNumber(qs.get("w"));
        if (qs.get("h")) resize.height = getQSNumber(qs.get("h"));
        if (qs.get("fit")) resize.fit = qs.get("fit");
        if (Object.keys(resize).length) img = img.resize(resize);

        //TODO sharpen

        const modulate = {};
        if (qs.get("brightness"))
            modulate.brightness = getQSNumber(qs.get("brightness"), true);
        if (qs.get("saturation"))
            modulate.saturation = getQSNumber(qs.get("saturation"), true);
        if (qs.get("hue")) modulate.hue = getQSNumber(qs.get("hue"));
        if (Object.keys(modulate).length) img = img.modulate(modulate);

        if (qs.get("normalize")) img = img.normalize();
        if (qs.get("negate")) img = img.negate();
        if (qs.get("gamma")) {
            img = img.gamma(
                getQSNumber(qs.get("gamma"), true),
                qs.get("gammaOut")
                    ? getQSNumber(qs.get("gammaOut", true))
                    : undefined
            );
        }

        if (qs.get("blur")) img = img.blur(parseInt(qs.get("blur")));

        if (qs.get("median")) img = img.median(parseInt(qs.get("median")));
        if (qs.get("flip")) img = img.flip();
        if (qs.get("flop")) img = img.flop();

        if (qs.get("rotate")) img = img.rotate(parseInt(qs.get("rotate")));
        const res = await getFileStream(path);

        /** .greyscale() */
        if (qs.get("greyscale")) img = img.greyscale();

        return new Response(res.body.pipeThrough(Duplex.toWeb(img)), {
            headers: {
                "content-type": contentType ?? res.headers.get("content-type"),
            },
        });
    }
    return;
}
