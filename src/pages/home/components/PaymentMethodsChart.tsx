import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatCurrency";
import type { SaleStatisticsPaymentMethod } from "@/pages/sale/lib/sale.interface";

export interface PaymentMethodsChartProps {
  ventasMetodos: SaleStatisticsPaymentMethod[];
  comprasMetodos: SaleStatisticsPaymentMethod[];
}

const chartConfig = {
  value: { label: "Monto" },
  contado: { label: "Contado", color: "var(--chart-1)" },
  credito: { label: "Crédito", color: "var(--chart-3)" },
} satisfies ChartConfig;

function buildChartData(metodos: SaleStatisticsPaymentMethod[]) {
  return metodos.map((m) => ({
    name: m.payment_type,
    value: parseFloat(m.monto_total),
    cantidad: m.cantidad,
    fill: `var(--color-${m.payment_type.toLowerCase()})`,
  }));
}

export function PaymentMethodsChart({
  ventasMetodos,
  comprasMetodos,
}: PaymentMethodsChartProps) {
  const id = "payment-methods-chart";
  const [tab, setTab] = React.useState<"ventas" | "compras">("ventas");

  const isVentas = tab === "ventas";
  const metodos = isVentas ? ventasMetodos : comprasMetodos;
  const chartData = React.useMemo(() => buildChartData(metodos), [metodos]);

  const [activeMethod, setActiveMethod] = React.useState(
    chartData[0]?.name ?? "",
  );

  React.useEffect(() => {
    if (chartData.length > 0) {
      setActiveMethod(chartData[0].name);
    }
  }, [tab]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((d) => d.name === activeMethod),
    [activeMethod, chartData],
  );

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card data-chart={id} className="border-none shadow-md">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Métodos de Pago</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribución por tipo · {isVentas ? "Ventas" : "Compras"}
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
      <CardContent className="pt-0 pb-3">
        {chartData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="aspect-square w-[160px] shrink-0"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(val) => (
                        <span className="font-mono tabular-nums">
                          S/ {formatNumber(Number(val))}
                        </span>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  strokeWidth={4}
                  activeIndex={activeIndex}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 8} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 18}
                        innerRadius={outerRadius + 10}
                      />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const current = chartData[activeIndex >= 0 ? activeIndex : 0];
                        if (!current) return null;
                        const pct =
                          total > 0
                            ? ((current.value / total) * 100).toFixed(0)
                            : "0";
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-xl font-bold"
                            >
                              {pct}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 18}
                              className="fill-muted-foreground text-xs"
                            >
                              {current.name}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Legend / detail */}
            <div className="flex flex-col gap-2 flex-1">
              {chartData.map((d) => {
                const isActive = d.name === activeMethod;
                return (
                  <button
                    key={d.name}
                    onClick={() => setActiveMethod(d.name)}
                    className={`text-left rounded-md px-2 py-1.5 transition-colors ${
                      isActive
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.fill }}
                      />
                      <span className="text-xs font-medium">{d.name}</span>
                    </div>
                    <p className="text-sm font-semibold pl-4">
                      S/ {formatNumber(d.value)}
                    </p>
                    <p className="text-xs text-muted-foreground pl-4">
                      {d.cantidad} transacciones
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Sin datos para el período
          </div>
        )}
      </CardContent>
    </Card>
  );
}
