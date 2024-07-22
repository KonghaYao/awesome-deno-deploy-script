import { createLoadBalence } from "./index.ts"; // 请替换为实际路径
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("测试加全负载均衡在大数据量下的表现", async () => {
  // 定义一些测试节点
  const nodes = [
    { name: "Node1", weight: 1 },
    { name: "Node2", weight: 2 },
    { name: "Node3", weight: 3 },
  ];

  // 创建负载均衡器
  const getNode = createLoadBalence(nodes);
  const testInputs = [...Array(10000).keys()].map((i) => "test" + i);
  const resultCount = new Map<string, number>();
  for (const input of testInputs) {
    const node = await getNode(input);
    resultCount.set(node.name, (resultCount.get(node.name) || 0) + 1);
  }
//   console.log(resultCount);
  assertEquals(
    resultCount.get("Node3")! / resultCount.get("Node1")! - 3 < 0.1,
    true
  );
  assertEquals(
    resultCount.get("Node2")! / resultCount.get("Node1")! - 2 < 0.1,
    true
  );
});
