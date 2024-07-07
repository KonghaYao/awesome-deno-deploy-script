import * as echarts from "npm:echarts";

Deno.serve(
    /**
     *
     * @param {Request} req
     */
    async (req) => {
        if (req.method !== "POST")
            return new Response("Method Not Allowed", { status: 405 });

        const data = await req.json();
        let chart = echarts.init(null, null, {
            renderer: "svg", // must use SVG rendering mode
            ssr: true, // enable SSR
            width: data.width, // need to specify height and width
            height: data.height,
        });

        chart.setOption(data);

        const svgStr = chart.renderToSVGString();

        chart.dispose();
        chart = null;
        return new Response(svgStr, {
            headers: {
                "Content-Type": "image/svg+xml",
            },
        });
    }
);
