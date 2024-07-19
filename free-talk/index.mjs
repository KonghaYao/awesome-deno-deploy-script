/** 后端免登录评论区 */
import { Elysia, t } from "https://esm.sh/elysia";

const app = new Elysia();
const kv = await Deno.openKv();

app.get(
  "/posts/list",
  async (ctx) => {
    const iter = kv.list(
      {
        prefix: ["free-talk", ctx.query.channel],
        start: ctx.query.start && [
          "free-talk",
          ctx.query.channel,
          ctx.query.start,
        ],
      },
      { limit: 11 }
    );
    const items = [];
    for await (const res of iter) items.push(res);

    return {
      data: items.slice(0, 10).map((i) => i.value),
      next: items.length === 11 && items[items.length - 1].key[2],
    };
  },
  {
    query: t.Object({
      channel: t.String(),
      start: t.Optional(t.String()),
    }),
  }
);
app.get(
  "/posts/get",
  async (ctx) => {
    const id = ctx.query.id;
    const channel = ctx.query.channel;
    const iter = await kv.get(["free-talk", channel, id]);
    return { data: iter.value };
  },
  {
    query: t.Object({
      id: t.String(),
      channel: t.String(),
    }),
  }
);

app.post(
  "/posts/create",
  async (ctx) => {
    const content = ctx.body;
    await kv.set(["free-talk", content.channel, content.title], content);
    return { code: 0, msg: "创建成功" };
  },
  {
    body: t.Object({
      channel: t.String(),
      title: t.String(),
      author: t.String(),
      content: t.String(),
    }),
  }
);

Deno.serve(app.fetch);
