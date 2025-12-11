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
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
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
      <CardContent className="px-4 md:px-6">
        {data.length > 0 ? (
          <ChartContainer
            config={{
              quantity: {
                label: "Cantidad",
                color: "var(--primary)",
              },
            }}
            className="h-[280px] w-full"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10 }}
                width={100}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, props) => [
                      `${value} unidades - S/. ${props.payload.revenue.toFixed(
                        2
                      )}`,
                      "Cantidad",
                    ]}
                  />
                }
              />
              <Bar
                dataKey="quantity"
                fill="var(--primary)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            No hay datos de productos vendidos
          </div>
        )}
      </CardContent>
    </Card>
  );
}
