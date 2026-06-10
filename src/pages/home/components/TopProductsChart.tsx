import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
  currencySymbol?: string;
}

export function TopProductsChart({ data, currencySymbol= "S/" }: TopProductsChartProps) {
  // Transform data to include fill color for each product
  const chartData = data.map((product, index) => ({
    ...product,
    fill: `var(--color-product-${index + 1})`,
  }));

  // Create dynamic chart config based on products
  const chartConfig = {
    quantity: {
      label: "Cantidad",
    },
    ...Object.fromEntries(
      data.map((product, index) => [
        `product-${index + 1}`,
        {
          label: product.name,
          color: `var(--chart-${(index % 5) + 1})`,
        },
      ])
    ),
  } satisfies ChartConfig;

  const totalQuantity = data.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const totalRevenue = data.reduce((sum, product) => sum + product.revenue, 0);

  // Custom tick component for truncating long text
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-95}
          y={0}
          dy={4}
          textAnchor="start"
          fill="currentColor"
          fontSize={10}
          className="line-clamp-1 fill-slate-600 dark:fill-slate-400"
          style={{
            maxWidth: "100px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <title>{payload.value}</title>
          {payload.value.length > 15
            ? `${payload.value.substring(0, 15)}...`
            : payload.value}
        </text>
      </g>
    );
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top 5 Productos</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Por cantidad vendida</p>
      </CardHeader>
      <CardContent className="pt-1">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 8 }}
            >
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={<CustomYAxisTick />}
                width={110}
              />
              <XAxis dataKey="cantidad" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, props) => [
                      `${
                        props.payload.name
                      } (${value} unidades) - ${currencySymbol} ${props.payload.revenue.toFixed(
                        2
                      )}`,
                    ]}
                  />
                }
              />
              <Bar dataKey="cantidad" layout="vertical" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Sin datos para el período
          </div>
        )}
      </CardContent>
      <CardContent className="pt-0 pb-3 px-4 text-sm text-muted-foreground">
        <div>Total: {totalQuantity} unidades · {currencySymbol} {totalRevenue.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
