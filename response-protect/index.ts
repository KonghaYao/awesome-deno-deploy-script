/**
 * 提供 Request 校验，反爬
 *
 */
export const ResponseProtect = (
  request: Request,
  config: {
    UA?: boolean;
    Referer?: (string | RegExp)[];
    allowRefererVoid?: boolean;
  }
) => {
  if (config.UA) {
    const ua = request.headers.get("user-agent");
    if (!ua) throw new Error("非法拦截 UA");
  }
  if (config.Referer) {
    const Referer = request.headers.get("Referer");
    if (!Referer && !config.allowRefererVoid)
      throw new Error("Referer 不能为空");
    const getHost = () => new URL(Referer!).host;
    if (
      Referer &&
      config.Referer.some((i) =>
        typeof i === "string" ? getHost() === i : i.test(getHost())
      )
    )
      throw new Error("您的网站已经被禁止使用服务");
  }
};
