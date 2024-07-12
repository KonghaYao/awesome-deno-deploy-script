// 授权码注册
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

// 在登录页进行登录
let server = await Auth.owner.getToken("mira", "12345");
console.log("登录成功", server.accessToken);
const oAuthFetch = async (url, req = { url }) => {
  req.method = req.method ?? "get";
  const data = await server.sign(req);
  return fetch(data.url ?? url, data);
};

console.log(origin);
// 登录成功，获取重定向 URL
const toURL = await oAuthFetch(origin + "/login/oauth/authorize", {
  method: "post",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    client_id: "clientId1",
    response_type: "code",
    state: "my-app-name",
    redirect_uri: "http://localhost:8000/callback.html",
    // data
  }),
})
  .then((res) => {
    return res.json();
  })
  .then((res) => {
    console.log(res);
    const url = new URL(res.redirectUri);
    url.searchParams.set("code", res.authorizationCode);
    url.searchParams.set("redirect_uri", "http://localhost:8000/callback.html");
    return url.toString();
  });

// 重定向之后的网站，再获取 token
console.log(toURL);
const OtherAuth = new ClientOAuth2({
  clientId: "clientId1",
  clientSecret: "client@secret",
  accessTokenUri: origin + "/login/oauth/access_token",
  authorizationUri: origin + "/login/oauth/authorize",
  redirectUri: "http://localhost:8000/callback.html",
});
const auth = await OtherAuth.code.getToken(toURL);
console.log(auth);
