/**
 * IP 地址查询接口
 * 无 CORS
 */

// https://ip2location.deno.dev?ip=101.67.50.27
Deno.serve((req) => {
    const fd = new FormData();
    fd.set("ip", new URL(req.url).searchParams.get("ip"));
    return fetch("https://iplocation.com/", {
        headers: {
            accept: "*/*",
            "accept-language":
                "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            priority: "u=1, i",
            "sec-ch-ua":
                '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
        },
        referrer: "https://iplocation.com/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: fd,
        method: "POST",
        mode: "cors",
        credentials: "include",
    });
});
