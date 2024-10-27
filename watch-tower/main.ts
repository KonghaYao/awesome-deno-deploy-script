import { kvdex, model, collection } from "jsr:@olli/kvdex";

export interface Metrics {
  os?: string;
  browser?: string;
  browserType?: string;
  browserVersion?: string;
  device?: string;
  deviceType?: string;
  language?: string;
  referer?: string;
  event?: string;
  host: string;
  createTime: string;
}

const kv = await Deno.openKv();

const MetricsModel = model<Metrics>();
const db = kvdex(kv, {
  metrics: collection(MetricsModel),
});

/** 总服务入口，get 记录，post 分析 */
export const handler = async (req: Request, connInfo) => {
  if (req.method === "POST") {
    return handlerAnalysis(req, connInfo);
  }
  return recordHandler(req, connInfo);
};

/** 记录服务 */
export const recordHandler = async (req: Request, connInfo) => {
  const log = Object.fromEntries(new URL(req.url).searchParams.entries());
  await db.metrics.add(log, { expireIn: 1000 * 60 * 60 * 24 * 5 });
  return new Response(
    JSON.stringify({
      code: 0,
      message: "success",
    })
  );
};

/** 分析层 */
export const handlerAnalysis = async (req: Request, connInfo) => {
  const qs = new URL(req.url).searchParams;
  const events = qs.get("events")?.split(",") || [];
  // 聚合函数这里写
  const agg = [getHostRate(), totalCount()];

  await db.metrics.forEach((doc) => {
    // 过滤函数这里写
    if (events.length > 0 && !events.includes(doc.value.event)) return;

    agg.forEach((fn) => {
      fn.forEach(doc.value);
    });
  });
  return new Response(
    JSON.stringify({
      result: Object.assign({}, ...agg.map((fn) => fn.result())),
    }),
    {
      headers: {
        // CORS 头部
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "content-type": "application/json",
      },
    }
  );
};

class CountingMap<T> extends Map<string, T[]> {
  add(key: string, data: T): this {
    if (super.has(key)) {
      super.get(key)!.push(data);
    } else {
      super.set(key, [data]);
    }
    return this;
  }
}

/** 分析层 1 统计 host 访问量 */
const getHostRate = () => {
  const hostCount = new CountingMap<Metrics>();
  return {
    result: () => {
      return {
        topHost: [...hostCount.entries()]
          .sort(([_, v], [__, v1]) => {
            return v1.length - v.length;
          })
          .slice(0, 20)
          .map(([k, v]) => {
            return [
              k,
              // 按照时间聚合
              [...groupByDate(v, "createTime").entries()].map(([k, v]) => {
                return [k, v.length];
              }),
            ];
          }),
      };
    },
    forEach(doc: Metrics) {
      hostCount.add(doc.host, doc);
    },
  };
};

/** 分析层 2 统计访问量 */
const totalCount = () => {
  let totalCount = 0;
  return {
    result: () => {
      return {
        totalCount,
      };
    },
    forEach(doc: Metrics) {
      totalCount++;
    },
  };
};

import { format, parseISO } from "https://esm.sh/date-fns";
/** 时间聚合函数 */
function groupByDate<T extends string, K extends { [k in T]: string }>(
  items: K[],
  dateKey: T,
  timeFormat = "yyyy-MM-dd HH"
) {
  return items.reduce((acc, item) => {
    try {
      const date: string = format(parseISO(item[dateKey]), timeFormat);
      if (!acc.has(date)) {
        acc.set(date, [item]);
        return acc;
      }
      acc.get(date)!.push(item);
      return acc;
    } catch (e) {
      console.log("error", e.message, dateKey, item[dateKey]);
      return acc;
    }
  }, new Map<string, K[]>());
}
