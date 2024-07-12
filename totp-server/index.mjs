/**
 * TOTP 服务就是常见的一次性 6 位验证码验证
 */
import elysia from "https://esm.sh/elysia";
import * as OTPAuth from "https://esm.sh/otpauth";

const app = new elysia();
const kv = await Deno.openKv();

/**
 * 生成一个新的密钥
 * @todo 需要鉴权
 */
app.get("/generate-secret", async (ctx) => {
  const username = ctx.query.username;
  if (!username) {
    return new Response("User ID is required", { status: 400 });
  }

  const secret = new OTPAuth.Secret();
  await kv.set(["TOTP-secret", username], secret.base32);
  return { username, secret: secret.base32, uri: totp.toString() };
});

/**
 * 生成 OTP
 * @todo 需要鉴权
 */
app.get("/generate-otp", async (req) => {
  const username = req.query.username;
  if (!username) {
    return new Response("Invalid User ID", { status: 400 });
  }
  const secretKv = await kv.get(["TOTP-secret", username]);
  if (!secretKv.value)
    return new Response(" User need to open TOTP first", { status: 400 });

  const secret = OTPAuth.Secret.fromBase32(secretKv.value);
  const totp = new OTPAuth.TOTP({
    secret: secret,
    digits: 6,
    period: 30,
  });

  const token = totp.generate();
  return { username, otp: token };
});

// 验证 OTP
app.get("/verify-otp", async (req) => {
  const username = req.query.username;
  const token = req.query.token;
  if (!username || !token) {
    return new Response("Invalid request", { status: 400 });
  }
  const secretKv = await kv.get(["TOTP-secret", username]);
  if (!secretKv.value)
    return new Response(" User need to open TOTP first", { status: 400 });

  const secret = OTPAuth.Secret.fromBase32(secretKv.value);
  const totp = new OTPAuth.TOTP({
    secret: secret,
    digits: 6,
    period: 30,
  });

  const isValid = totp.validate({ token: token, window: 1 }) !== null;
  return { username, isValid };
});

Deno.serve(app.fetch);
