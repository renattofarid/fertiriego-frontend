import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatCurrency";
import type {
  SaleStatisticsTopProductVenta,
  SaleStatisticsTopProductCompra,
} from "@/pages/sale/lib/sale.interface";

export interface TopProductsChartProps {
  ventasData: SaleStatisticsTopProductVenta[];
  comprasData: SaleStatisticsTopProductCompra[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const label: string = payload.value;
  const truncated = label.length > 16 ? `${label.substring(0, 16)}…` : label;
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{label}</title>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="currentColor"
        fontSize={10}
      >
        {truncated}
      </text>
    </g>
  );
};

export function TopProductsChart({
  ventasData,
  comprasData,
}: TopProductsChartProps) {
  const [tab, setTab] = useState<"ventas" | "compras">("ventas");

  const isVentas = tab === "ventas";
  const raw = isVentas ? ventasData : comprasData;

  const chartData = raw.map((p, i) => ({
    name: p.name,
    cantidad: parseFloat(p.total_cantidad),
    monto: parseFloat(
      isVentas
        ? (p as SaleStatisticsTopProductVenta).total_vendido
        : (p as SaleStatisticsTopProductCompra).total_comprado,
    ),
    fill: COLORS[i % COLORS.length],
  }));

  const chartConfig = {
    cantidad: { label: "Cantidad" },
    ...Object.fromEntries(
      raw.map((p, i) => [
        `product-${i + 1}`,
        { label: p.name, color: COLORS[i % COLORS.length] },
      ]),
    ),
  } satisfies ChartConfig;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Top 5 Productos</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Por cantidad {isVentas ? "vendida" : "comprada"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant={isVentas ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setTab("ventas")}
          >
            Ventas
          </Button>
          <Button
            variant={!isVentas ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setTab("compras")}
          >
            Compras
          </Button>
        </div>
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
                      `${props.payload.name}: ${formatNumber(Number(value), 0)} uds · S/ ${formatNumber(props.payload.monto)}`,
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
    </Card>
  );
}
