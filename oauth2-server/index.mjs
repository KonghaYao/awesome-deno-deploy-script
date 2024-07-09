import { Elysia, t } from "https://esm.sh/elysia";
import { oauth2 } from "https://esm.sh/@myazarc/elysia-oauth2-server";
import { snake } from "npm:naming-style";
import { DenoKVModel } from "./deno_kv.model.ts";

/** 标准 OAuth 是蛇形命名法，所以需要转化 key 值 */
const toSnakeObject = (data) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (typeof value === "object" && !(value instanceof Array)) {
        return [snake(key), toSnakeObject(value)];
      }
      return [snake(key), value];
    })
  );
};

const kv = await Deno.openKv();
const app = new Elysia();
app
  .get("/", () => {
    return new Response(
      Deno.readTextFileSync("./oauth2-server/index.test.html"),
      {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      }
    );
  })
  .get(
    // verifing token
    "/api/users",
    ({ oauth2, ...payload }) => {
      return oauth2.authenticate(payload).then((res) => toSnakeObject(res));
    },
    {
      headers: t.Object({
        // Example: "Basic " + Buffer.from("clientId1:client@secret").toString("base64"),
        authorization: t.String(),
      }),
    }
  );

app
  .use(
    oauth2({
      model: await new DenoKVModel(kv).initExample(),
      // model: new MemoryModel(),
    })
  )
  .post(
    // 获取 token 的接口
    "/login/oauth/access_token",
    ({ oauth2, ...payload }) => {
      return oauth2.token(payload).then((res) =>
        toSnakeObject({
          token_type: "bearer",
          ...res.data,
        })
      );
    },
    {
      headers: t.Object({
        // Example: "Basic " + Buffer.from("clientId1:client@secret").toString("base64"),
        authorization: t.String(),
      }),
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
    // verifing token
    "/login/oauth/authorize",
    ({ oauth2, ...payload }) => {
      return oauth2.authenticate(payload).then((res) => toSnakeObject(res));
    },
    {
      headers: t.Object({
        // Example: "Basic " + Buffer.from("clientId1:client@secret").toString("base64"),
        authorization: t.String(),
      }),
    }
  );
Deno.serve(app.fetch);
