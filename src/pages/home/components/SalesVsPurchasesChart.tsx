import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/formatCurrency";

export interface TransactionData {
  label: string;
  compras: number;
  ventas: number;
}

export interface SalesVsPurchasesChartProps {
  data: TransactionData[];
}

const chartConfig = {
  ventas: {
    label: "Ventas",
    color: "hsl(var(--chart-1))",
  },
  compras: {
    label: "Compras",
    color: "hsl(var(--chart-2))",
  },
};

export function SalesVsPurchasesChart({ data }: SalesVsPurchasesChartProps) {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 space-y-0 border-b pb-3">
        <div className="grid flex-1 gap-0.5">
          <CardTitle className="text-base">Compras vs Ventas</CardTitle>
          <CardDescription className="text-xs">
            Montos por transacción en el período seleccionado
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pt-3">
        {data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[220px] w-full"
          >
            <AreaChart
              data={data}
              margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillCompras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                className="text-xs"
                tickFormatter={(value: string) =>
                  value.length > 8 ? value.slice(-6) : value
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                tickFormatter={(value) => formatNumber(Number(value), 0)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    indicator="dot"
                    formatter={(val) => (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {formatCurrency(Number(val), {
                          currencySymbol: "S/.",
                          decimals: 2,
                        })}
                      </span>
                    )}
                  />
                }
              />
              <Area
                dataKey="ventas"
                type="monotone"
                fill="url(#fillVentas)"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                dataKey="compras"
                type="monotone"
                fill="url(#fillCompras)"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            No hay datos para el período seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
