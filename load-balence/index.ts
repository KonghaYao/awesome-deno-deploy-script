import HashRing from "https://esm.sh/hashring@3.2.0";

/**
 * 创建一个负载均衡器
 * */
export function createLoadBalence<T extends { name: string; weight: number }>(
  nodes: T[]
) {
  const config = nodes.reduce((col, node) => {
    col[node.name] = {
      vnodes: node.weight,
    };
    return col;
  }, {} as any);
  const ring = new HashRing(config);
  /** 根据传入的标识符返回一个可用节点 */
  return async function getNode(input: string): Promise<T> {
    const name = await ring.get(input);
    return nodes.find((node) => node.name === name)!;
  };
}
