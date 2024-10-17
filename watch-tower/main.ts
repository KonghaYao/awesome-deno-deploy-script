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
    host: string;
}

const kv = await Deno.openKv();

const MetricsModel = model<Metrics>();
const db = kvdex(kv, {
    metrics: collection(MetricsModel),
});

/**
 * post 获取分析数据
 * get 加载埋点数据
 */
export const handler = async (req: Request, connInfo) => {
    if (req.method === "POST") {
        return handlerAnalysis(req, connInfo);
    }
    return recordHandler(req, connInfo);
};

export const recordHandler = async (req: Request, connInfo) => {
    const log = Object.fromEntries(new URL(req.url).searchParams.entries());
    await db.metrics.add(log, { expireIn: 1000 * 60 });
    return new Response(
        JSON.stringify({
            code: 0,
            message: "success",
        })
    );
};

export const handlerAnalysis = async (req: Request, connInfo) => {
    const agg = [getHostRate()];
    await db.metrics.forEach((doc) => {
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
const getHostRate = () => {
    const hostCount = new CountingMap<Metrics>();
    return {
        result: () => {
            return {
                top20Host: [...hostCount.entries()]
                    .sort(([_, v], [__, v1]) => {
                        return v1.length - v.length;
                    })
                    .slice(0, 20),
            };
        },
        forEach(doc: Metrics) {
            hostCount.add(doc.host, doc);
        },
    };
};
