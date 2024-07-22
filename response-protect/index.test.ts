import { ResponseProtect } from "./index.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
Deno.test("UA protect", () => {
  const request = new Request("https://example", {
    headers: {},
  });
  try {
    ResponseProtect(request, { UA: true });
    throw new Error("测试失败");
  } catch (e) {
    assertEquals(e.message, "非法拦截 UA");
  }
});

Deno.test("UA protect 通过测试", () => {
  const request = new Request("https://example", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    },
  });
  try {
    ResponseProtect(request, { UA: true });
  } catch (e) {
    throw e;
  }
});

Deno.test("Referer protect 通过测试", () => {
  const request = new Request("https://example", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      referer: "https://example.info.com",
    },
  });
  try {
    ResponseProtect(request, { UA: true, Referer: ["example.com"] });
  } catch (e) {
    throw e;
  }
  request.headers.set("referer", "https://example.com");
  try {
    ResponseProtect(request, { UA: true, Referer: ["example.com"] });
    throw new Error("测试失败");
  } catch (e) {
    assertEquals(e.message, "您的网站已经被禁止使用服务");
  }
});

Deno.test("Referer protect 正则通过测试", () => {
  const request = new Request("https://example", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      referer: "https://info.example.com",
    },
  });
  try {
    ResponseProtect(request, { UA: true, Referer: [/.*\.example.com/] });
    throw new Error("测试失败");
  } catch (e) {
    assertEquals(e.message, "您的网站已经被禁止使用服务");
  }
  request.headers.set("referer", "https://x.example.com");
  try {
    ResponseProtect(request, { UA: true, Referer: [/.*\.example.com/] });
    throw new Error("测试失败");
  } catch (e) {
    assertEquals(e.message, "您的网站已经被禁止使用服务");
  }
});
