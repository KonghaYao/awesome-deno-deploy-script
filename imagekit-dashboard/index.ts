import { AwesomeFetch } from "../awesome-fetch/index.ts";

export const getDataFromImageKit = async (params: {
    email: string;
    password: string;
    // 2024-07-28T23:59:59+08:00
    startTime: string;
    endTime: string;
}) => {
    const { fetch } = AwesomeFetch(globalThis.fetch);

    const { token: csrfToken } = await fetch("https://imagekit.io/api/csrf/", {
        headers: {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "content-type": "application/json",
            priority: "u=1, i",
            "sec-ch-ua":
                '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-ik-csrf-internal-request-token":
                "lsdjlsdlfo2ekskndfn29839usdkfn23092!QW33@",
        },
        referrer: "https://imagekit.io/login/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
    }).then((res) => {
        return res.json();
    });

    await fetch("https://imagekit.io/login", {
        headers: {
            "content-type": "application/json",
            "x-csrf-token": csrfToken,
        },
        referrer: "https://imagekit.io/login/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(params),
        method: "POST",
        mode: "cors",
        credentials: "include",
    }).then((res) => res.json());
    // console.log(user);
    const userID = await fetch("https://imagekit.io/dashboard/profile", {
        headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "zh-CN,zh;q=0.9",
            "if-none-match": 'W/"2b5b-+ZusN0cIIGMO8E68xMyB95pjxMY"',
            priority: "u=0, i",
            "sec-ch-ua":
                '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
        },
        referrer: "https://imagekit.io/login/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
    })
        .then((res) => res.text())
        .then((res) => {
            return res.match(/"clientNumber":"(.*?)"/)![1];
        });
    console.log(userID);
    const data = await fetch(
        `https://imagekit.io/api/graphs/${userID}/${params.startTime}/${params.endTime}`,
        {
            referrer: "https://imagekit.io/dashboard/analytics/overall-usage",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
        }
    ).then((res) => res.json());

    // console.log(data);
    return data;
};
