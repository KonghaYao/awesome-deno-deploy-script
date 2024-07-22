async function getWeight(text: string, count: number) {
  const data = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return (
    [...new Uint32Array(data)]
      .map((i) => i % count)
      .reduce((a, b) => a + b, 0) % count
  );
}
/** 创建一个负载均衡器 */
export function createLoadBalence<T extends { name: string; weight: number }>(
  nodes: T[]
) {
  const totalWeight = nodes.reduce((sum, node) => sum + node.weight, 0);
  if (totalWeight === 1) throw new Error("权重之和必须大于 1");
  /** 根据传入的标识符返回一个可用节点 */
  return async function getNode(input: string): Promise<T> {
    const weightedIndex = await getWeight(input, totalWeight);
    let cumulativeWeight = 0;
    for (const node of nodes) {
      cumulativeWeight += node.weight;
      if (weightedIndex < cumulativeWeight) {
        return node;
      }
    }
    return nodes[0];
  };
}
