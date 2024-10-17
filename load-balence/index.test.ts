import { createLoadBalence } from "./index.ts"; // 请替换为实际路径
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("测试加全负载均衡在大数据量下的表现", async () => {
  // 定义一些测试节点
  const nodes = [
    { name: "Node1", weight: 100 },
    { name: "Node2", weight: 200 },
    { name: "Node3", weight: 300 },
  ];

  // 创建负载均衡器
  const getNode = createLoadBalence(nodes);
  const testInputs = [...Array(100000).keys()].map((i) => "test" + i);
  const resultCount = new Map<string, number>();
  for (const input of testInputs) {
    const node = await getNode(input);
    resultCount.set(node.name, (resultCount.get(node.name) || 0) + 1);
  }
  console.log(resultCount.get("Node3")! / resultCount.get("Node1")! - 3);
  assertEquals(
    resultCount.get("Node3")! / resultCount.get("Node1")! - 3 < 0.2,
    true
  );
  assertEquals(
    resultCount.get("Node2")! / resultCount.get("Node1")! - 2 < 0.2,
    true
  );
});

Deno.test("测试增加、删除节点稳定性", async () => {
  const weight = 10
  // 定义一些测试节点
  const nodes = [
    { name: "Node1", weight },
    { name: "Node2", weight },
    { name: "Node3", weight },
    { name: "Node4", weight },
    { name: "Node5", weight },
    { name: "Node6", weight },
    { name: "Node7", weight },
  ];

  // 创建负载均衡器
  const getNode = createLoadBalence(nodes);
  const testInputs = [...Array(100000).keys()].map((i) => "test" + i);
  const resultCount = new Map<string, string>();
  console.time("test");
  for (const input of testInputs) {
    const node = await getNode(input);
    resultCount.set(input, node.name);
  }
  console.timeEnd('test');

  const nodes2 = [
    { name: "Node2", weight },
    { name: "Node3", weight },
    { name: "Node4", weight },
    { name: "Node5", weight },
    { name: "Node6", weight },
    { name: "Node7", weight },
  ];

  // 创建负载均衡器
  const getNode2 = createLoadBalence(nodes2);
  const resultCount2 = new Map<string, string>();
  for (const input of testInputs) {
    const node = await getNode2(input);
    resultCount2.set(input, node.name);
  }
  let hit = 0;
  let miss = 0;
  [...resultCount.keys()].forEach((key: string) => {
    const a = resultCount.get(key);
    const b = resultCount2.get(key);
    if (!a || !b || a !== b) {
      miss++;
    } else {
      hit++;
    }
  });

  console.log(hit, miss);
  // 删除之后，缓存成功率在 0.8 即可
  assertEquals(hit / (hit + miss) > 0.8, true);
});
