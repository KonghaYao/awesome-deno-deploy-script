import { UAParser } from "https://esm.sh/ua-parser-js@2.0.0-beta.3";
import {
    CLIs,
    Crawlers,
    Emails,
    ExtraDevices,
    Fetchers,
    InApps,
    MediaPlayers,
    Modules,
} from "https://esm.sh/ua-parser-js@2.0.0-beta.3/extensions";
import { parseAcceptLanguage } from "https://esm.sh/intl-parse-accept-language";
export const getLogFromRequest = (req: Request, ip?: string) => {
    const referer = req.headers.get("Referer") || req.url;

    const acceptLanguage = req.headers.get("accept-language") || "";
    const language = (parseAcceptLanguage(acceptLanguage) || [])[0];

    const userAgent = req.headers.get("user-agent") || "";
    const uaInfo = new UAParser(userAgent, {
        browser: [
            Crawlers.browser || [],
            CLIs.browser || [],
            Emails.browser || [],
            Fetchers.browser || [],
            InApps.browser || [],
            MediaPlayers.browser || [],
            Modules.browser || [],
        ].flat(),
        device: [ExtraDevices.device || []].flat(),
    }).getResult();
    const log = {
        os: uaInfo?.os?.name,
        browser: uaInfo?.browser?.name,
        browserType: uaInfo?.browser?.type,
        browserVersion: uaInfo?.browser?.version,
        device: uaInfo?.device?.model,
        deviceType: uaInfo?.device?.type,
        language,
        referer,
        host: referer ? new URL(referer).host : null,
        ip,
        createTime: new Date().toISOString(),
    };
    return log;
};

/**  */
export const getReportURL = (host: any, log: any) => {
    const url = new URL(host);
    url.search = new URLSearchParams([...Object.entries(log)].filter(([k, v]) => v)).toString();
    return url;
};
