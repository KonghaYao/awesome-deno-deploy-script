import { Elysia, t } from "https://esm.sh/elysia";
import { UserApi } from "./UserApi.ts";
import { Oauth2Api } from "./OAuth2Api.ts";
import { DenoKVModel } from "./deno_kv.model.ts";
import { OAuth2Page } from "./OAuth2Page.ts";


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

// 注册用户和 client 相关的接口
UserApi(app);

// 注册oauth2相关的接口
Oauth2Api(app, model);

// 注册提供三方登录的页面
OAuth2Page(app)

Deno.serve(app.fetch);
