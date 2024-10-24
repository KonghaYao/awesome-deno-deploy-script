export const render = (content: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Watch Panel for</title>
  </head>
  <body>${content}</body>
</html>`;
};

interface GridTemplate {
  span: number;
  content: string;
}

export const renderGrid = (content: GridTemplate[]) => {
  // 24 分栏
  return `
<section style="display: grid; grid-template-columns: repeat(24, 1fr); gap: 10px;">
  ${content
    .map(
      (item) =>
        `<div style="grid-column: span ${item.span};">${item.content}</div>`
    )
    .join("")}
</section>
`;
};

export const renderChart = (options: any) => {
  // 生成一个唯一的ID
  const chartId = `chart-${Math.random().toString(36).substr(2, 9)}`;

  return `
<div id="${chartId}"></div>
<script type='module'>
  import { init } from 'https://esm.sh/echarts/dist/echarts.esm.min.js';

  const chart = init(document.getElementById('${chartId}'), null, {
    renderer: 'svg',
    width: ${options.gWidth ?? "500"},
    height: ${options.gHeight ?? "500"},
  });

  chart.setOption(${JSON.stringify(options)});
</script>
`;
};

export const renderHTML = (data: any) => {
  return new Response(
    render(
      renderGrid([
        {
          span: 12,
          content: renderChart({
            gWidth: 600,
            title: {
              text: "访问记录",
            },
            grid: {
              top: "10%",
              left: "10%",
              right: "10%", // 调整右侧边距以留出空间给图例
              bottom: "10%",
            },
            xAxis: {
              type: "time",
            },
            yAxis: {
              type: "value",
            },
            tooltip: {
              trigger: "axis",
            },
            series: data.result.topHost.map(([name, v]) => {
              return {
                name,
                type: "line",
                data: v.map(([k, v]) => {
                  return [k, v * 100];
                }),
              };
            }),
          }),
        },
      ])
    ),
    {
      headers: {
        "content-type": "text/html",
      },
    }
  );
};
