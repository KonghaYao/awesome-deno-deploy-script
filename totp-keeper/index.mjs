/**
 *
 */
import elysia from "https://esm.sh/elysia";
import * as OTPAuth from "https://esm.sh/otpauth";

const app = new elysia();
const kv = await Deno.openKv();
/**
 * 保存TOTP密钥
 */
app.get("/save-secret", async (ctx) => {
    const appName = ctx.query.appName;
    const code = ctx.query.code;
    if (!appName || !code) {
        return new Response("AppName and code is required", { status: 400 });
    }

    await kv.set(["TOTP-secret-keeper", appName], code);
    return { appName, code: 0 };
});

/**
 * 生成一次性密码(OTP)
 */
app.get("/generate-otp", async (req) => {
    const appName = req.query.appName;
    if (!appName) {
        return new Response("Invalid appName", { status: 400 });
    }
    const secretKv = await kv.get(["TOTP-secret-keeper", appName]);
    if (!secretKv.value)
        return new Response(" User need to open TOTP first", { status: 400 });

    const secret = OTPAuth.Secret.fromBase32(secretKv.value);
    const totp = new OTPAuth.TOTP({
        secret: secret,
        digits: 6,
        period: 30,
    });

    const token = totp.generate();
    return { appName, otp: token };
});

/**
 * 验证一次性密码(OTP)
 */
app.get("/verify-otp", async (req) => {
    const appName = req.query.appName;
    const token = req.query.token;
    if (!appName || !token) {
        return new Response("Invalid request", { status: 400 });
    }
    const secretKv = await kv.get(["TOTP-secret-keeper", appName]);
    if (!secretKv.value)
        return new Response(" User need to open TOTP first", { status: 400 });

    const secret = OTPAuth.Secret.fromBase32(secretKv.value);
    const totp = new OTPAuth.TOTP({
        secret: secret,
        digits: 6,
        period: 30,
    });

    const isValid = totp.validate({ token: token, window: 1 }) !== null;
    return { appName, isValid };
});
Deno.serve(app.fetch);
