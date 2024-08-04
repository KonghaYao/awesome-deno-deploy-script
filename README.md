# Deno Script

这个一个收集 Deno Deploy 脚本的仓库，旨在使用一个 JS 文件实现一个服务器功能！

1. [file-share](./file-share/index.mjs) - 文件分享（通过 wetransfer）
2. [proxy-website](./proxy-website/index.mjs) - 全站代理 + CORS
3. [ip-location](./ip-location/index.mjs) - IP 地理位置查询
4. [url-shortener](./url-shortener/index.mjs) - URL 短链接生成，非常简单易用
5. [is-website-up](./is-website-up/index.mjs) - 检查网站是否可用
6. [chatroom](./chatroom/index.mjs) - 在线 Websocket 聊天室, 支持 WebRTC，无 KV 存储，[Sono](https://jsr.io/@sono/core)
7. [data-chart](./data-chart/index.mjs) - 在线渲染 echarts 图表为 SVG 数据
8. [qrcode](./qrcode/index.mjs) - 支持 QRcode 解析与生成的服务器脚本
9. [barcode](./qrcode/index.mjs) - 支持 Barcode 生成的脚本
10. [image-server](./image-server/index.mjs) - 图片服务器，可以在线帮你通过 url 处理图像
11. [totp-server](./totp-server/index.mjs) - TOTP 服务器, 用于 TOTP 鉴权认证
12. [load-balence](./load-balence/index.ts) - 负载均衡器，用于给不同的资源分配不同的来源
13. [response-protect](./response-protect/index.ts) - 防止恶意请求函数
14. [mermaid](./mermaid/index.ts) - 一个 Mermaid 绘图的网站，可以通过 iframe 直接渲染

## Deno will Do

1. [ ] deno kv dashboard
2. [ ] OAuth 授权服务器
3. [x] 图片处理服务器

```sh
curl -fsSL https://x.deno.js.cn/install.sh | sh
export DENO_INSTALL="/root/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
deno run -A --unstable qrcode/index.mjs
```
