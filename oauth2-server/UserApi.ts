import { Elysia, t } from "https://esm.sh/elysia";

let MASTERKEY = Deno.env.get("OAUTH2_MASTER_KEY");
if (!MASTERKEY) {
  MASTERKEY = crypto.randomUUID().toString();
  console.log("检测到未提供 OAUTH2_MASTER_KEY，自动生成", MASTERKEY);
}
const checkMasterKey = async (ctx) => {
  const masterKey = payload.headers.authorization.split(" ")[1];
  if (MASTERKEY !== masterKey) {
    throw new Error("Master Key is not valid");
  }
};
export const UserApi = (app, model) =>
  app
    .post(
      "/oauth/user/register",
      ({ oauth2, ...payload }) => {
        checkMasterKey(payload);
        return oauth2.registerUser(payload).then((res) => toSnakeObject(res));
      },
      {
        headers: t.Object({
          authorization: t.String(),
        }),
      }
    )
    .post(
      "/oauth/client/register",
      ({ oauth2, ...payload }) => {
        checkMasterKey(payload);
        return oauth2.registerClient(payload).then((res) => toSnakeObject(res));
      },
      {
        headers: t.Object({
          authorization: t.String(),
        }),
      }
    );
