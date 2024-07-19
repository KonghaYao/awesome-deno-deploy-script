import { Elysia, t } from "https://esm.sh/elysia";
import { ElysiaOAuthServer } from "./ElysiaOAuthServer.ts";
import { toSnakeObject } from "./toSnakeObject.ts";
const oauth2 = (options) => {
  const oauth = new ElysiaOAuthServer(options);

  return new Elysia({
    name: "ElysiaOAuth2Server",
  }).decorate("oauth2", oauth);
};

export const Oauth2Api = (app, model) =>
  app
    .use(
      oauth2({
        model,
      })
    )
    .post(
      // 获取 token 的接口
      "/login/oauth/access_token",
      ({ oauth2, ...payload }) => {
        return oauth2
          .token(payload)
          .then((res) => {
            return toSnakeObject({
              token_type: "bearer",
              ...res,
            });
          })
          .catch((err) => {
            console.log(err);
            return { code: 0, error: err.message };
          });
      },
      {
        body: t.Object({
          username: t.Optional(t.String()),
          password: t.Optional(t.String()),
          grant_type: t.String({
            examples: [
              "password",
              "refresh_token",
              "client_credentials",
              "authorization_code",
            ],
          }),
          code: t.Optional(t.String()),
          redirect_uri: t.Optional(t.String()),
          refresh_token: t.Optional(t.String()),
        }),
      }
    )
    .post(
      // 生成授权码跳转地址
      "/login/oauth/authorize",
      async ({ oauth2, ...payload }) => {
        const code = await oauth2.authorizeCode(payload, {
          authenticateHandler: {
            handle: async (request) => {
              return oauth2.authenticate(payload);
            },
          },
        });
        return new Response(JSON.stringify(code));
      },
      {
        // 需要先通过 用户名密码登录获取 token
        headers: t.Object({
          authorization: t.String(),
        }),
        body: t.Object({
          client_id: t.String(),
          response_type: t.String({
            examples: ["code", "token"],
          }),
          state: t.String(),
          redirect_uri: t.String(),
        }),
      }
    );
