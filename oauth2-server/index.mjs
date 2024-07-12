import { Elysia, t } from "https://esm.sh/elysia";
import { ElysiaOAuthServer } from "./ElysiaOAuthServer.ts";
import { snake } from "npm:naming-style";
import { DenoKVModel } from "./deno_kv.model.ts";
const oauth2 = (options) => {
  const oauth = new ElysiaOAuthServer(options);

  return new Elysia({
    name: "ElysiaOAuth2Server",
  }).decorate("oauth2", oauth);
};
/** 标准 OAuth 是蛇形命名法，所以需要转化 key 值 */
const toSnakeObject = (data) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (
        typeof value === "object" &&
        !(value instanceof Array) &&
        !(value instanceof Date)
      ) {
        return [snake(key), toSnakeObject(value)];
      }
      return [snake(key), value];
    })
  );
};

async function initExample(model) {
  await model.registerClient(
    {
      id: "clientId1",
      clientSecret: "client@secret",
      redirectUris: ["http://localhost:8000/callback.html"],
      grants: [
        "password",
        "authorization_code",
        "client_credentials",
        "refresh_token",
      ],
    },
    true
  );
  await model.registerUser(
    {
      username: "mira",
      password: "12345",
    },
    true
  );
  return model;
}

const kv = await Deno.openKv();
const app = new Elysia();
app.get(
  "/api/users",
  ({ oauth2, ...payload }) => {
    return oauth2.authenticate(payload).then((res) => {
      return { code: 0, msg: "资源获取成功" };
    });
  },
  {
    headers: t.Object({
      authorization: t.String(),
    }),
  }
);
const model = await initExample(new DenoKVModel(kv));
app
  .use(
    oauth2({
      model,
    })
  )
  .get("/", () => {
    return new Response(
      Deno.readTextFileSync("./oauth2-server/callback.html"),
      {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      }
    );
  })
  .post(
    "/oauth/user/register",
    ({ oauth2, ...payload }) => {
      return oauth2.registerUser(payload).then((res) => toSnakeObject(res));
    }
    // TODO 添加 token 验证
  )
  .post(
    "/oauth/client/register",
    ({ oauth2, ...payload }) => {
      return oauth2.registerClient(payload).then((res) => toSnakeObject(res));
    }
    // TODO 添加 token 验证
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
Deno.serve(app.fetch);
