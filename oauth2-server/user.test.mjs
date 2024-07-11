import "jsr:@kitsonk/xhr";
import ClientOAuth2 from "https://esm.sh/client-oauth2";

const origin = "http://localhost:8000";
const Auth = new ClientOAuth2({
  clientId: "clientId1",
  clientSecret: "client@secret",
  accessTokenUri: origin + "/login/oauth/access_token",
  authorizationUri: origin + "/login/oauth/authorize",
  redirectUri: origin + "/auth/callback",
});
fetch(origin + "/api/users")
  .then((res) => res.json())
  .then((res) => {
    console.log(res.message);
  });
// login to server
let server = await Auth.owner.getToken("mira", "12345");
console.log("登录成功", server.accessToken);

await server.expired();
server = await server.refresh();

console.log("刷新 token", server.accessToken);
const oAuthFetch = async (url, req = { url }) => {
  req.method = req.method ?? "get";
  const data = await server.sign(req);
  return fetch(data.url, data);
};
oAuthFetch(origin + "/api/users")
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
  });
