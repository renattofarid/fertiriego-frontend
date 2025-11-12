import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionData {
  date: string;
  compras: number;
  ventas: number;
}

interface SalesVsPurchasesChartProps {
  data: TransactionData[];
}

export function SalesVsPurchasesChart({ data }: SalesVsPurchasesChartProps) {
  const [timeRange, setTimeRange] = useState("90d");
  const [filteredData, setFilteredData] = useState<TransactionData[]>([]);

  // Filtrar datos según el rango de tiempo seleccionado
  useEffect(() => {
    if (data.length > 0) {
      const now = new Date();
      let daysToSubtract = 90;

      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }

      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysToSubtract);

      const filtered = data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate;
      });

      setFilteredData(filtered);
    }
  }, [data, timeRange]);

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

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 space-y-0 border-b pb-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base md:text-lg">
            Compras vs Ventas
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Comparación de montos en el período seleccionado
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg"
            aria-label="Seleccionar período"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 días
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pt-4 sm:pt-6">
        {filteredData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] sm:h-[320px] w-full"
          >
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillCompras" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--muted-foreground)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--muted-foreground)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatNumber(Number(value), 0)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("es-ES", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    indicator="dot"
                    formatter={(val) => (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {formatCurrency(Number(val), { currencySymbol: "S/.", decimals: 2 })}
                      </span>
                    )}
                  />
                }
              />
              <Area
                dataKey="ventas"
                type="natural"
                fill="url(#fillVentas)"
                stroke="var(--primary)"
                strokeWidth={2}
              />
              <Area
                dataKey="compras"
                type="natural"
                fill="url(#fillCompras)"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-[280px] sm:h-[320px] flex items-center justify-center text-muted-foreground text-sm">
            No hay datos disponibles para el período seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
