"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
}

export function TopProductsChart({ data }: TopProductsChartProps) {
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
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fill="currentColor"
          fontSize={10}
          className="line-clamp-1"
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">
          Top 5 Productos Más Vendidos
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Por cantidad vendida
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
              }}
            >
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={<CustomYAxisTick />}
                width={120}
              />
              <XAxis dataKey="quantity" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, props) => [
                      `${
                        props.payload.name
                      } (${value} unidades) - S/. ${props.payload.revenue.toFixed(
                        2
                      )}`,
                    ]}
                  />
                }
              />
              <Bar dataKey="quantity" layout="vertical" radius={5} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            No hay datos de productos vendidos
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total: {totalQuantity} unidades vendidas{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Ingresos totales: S/. {totalRevenue.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
}
