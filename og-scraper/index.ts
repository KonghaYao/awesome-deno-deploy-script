import og from "https://esm.sh/open-graph";

Deno.serve(async (req) => {
  // 转 promise
  const ogp = await new Promise((resolve, reject) => {
    og(new URL(req.url).searchParams.get("url"), (err, meta) => {
      if (err) {
        reject(err);
      } else {
        resolve(meta);
      }
    });
  });
  return new Response(JSON.stringify(ogp), {
    headers: {
      "content-type": "application/json",
    },
  });
});
