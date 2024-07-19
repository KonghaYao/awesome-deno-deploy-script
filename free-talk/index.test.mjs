import { assertEquals } from "https://deno.land/std@0.114.0/testing/asserts.ts";
const host = "http://localhost:8000";

const mockData = () => {
  return [...Array(20).keys()].map((i) => {
    return {
      title: "Test Title" + i,
      author: "Test Author" + i,
      content: "Test Content" + i,
    };
  });
};

for await (const iterator of mockData()) {
  const response = await fetch(host + "/posts/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(iterator),
  });
}

Deno.test("GET /posts/list", async () => {
  const response = await fetch(host + "/posts/list");
  const data = await response.json();
  assertEquals(response.status, 200);
  assertEquals(Array.isArray(data.data), true);
  assertEquals(data.data.length, 10);
  assertEquals(data.next, "Test Title17");

  const res = await fetch(host + "/posts/list?start=Test Title17");
  const data1 = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data1.data[0].title, 'Test Title17');

});

Deno.test("GET /posts/get", async () => {
  const response = await fetch(host + "/posts/get?id=test-id");
  const data = await response.json();
  assertEquals(response.status, 200);
  assertEquals(data.data, null); // 假设没有这个 id 的数据
});

Deno.test("GET /posts/get", async () => {
  const response = await fetch(host + "/posts/get?id=Test Title10");
  const data = await response.json();
  assertEquals(response.status, 200);
  assertEquals(data.data, {
    author: "Test Author10",
    content: "Test Content10",
    title: "Test Title10",
  });
});

Deno.test("POST /posts/create", async () => {
  const response = await fetch(host + "/posts/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Test Title",
      author: "Test Author",
      content: "Test Content",
    }),
  });
  const data = await response.json();
  assertEquals(response.status, 200);
});
