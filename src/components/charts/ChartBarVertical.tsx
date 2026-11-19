import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Props {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number; extra?: string }>;
  valueFormatter?: (value: number) => string;
  valueLabel?: string;
}

export function ChartBarVertical({
  title,
  subtitle,
  data,
  valueFormatter,
  valueLabel = "Valor",
}: Props) {
  const chartData = data.map((item, i) => ({
    key: `item_${i}`,
    label: item.name,
    value: item.value,
    extra: item.extra,
  }));

  const chartConfig = {
    value: { label: valueLabel, color: "var(--chart-1)" },
    ...Object.fromEntries(
      data.map((item, i) => [`item_${i}`, { label: item.name }]),
    ),
  } satisfies ChartConfig;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 0, top: 8, bottom: 24 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="key"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              height={60}
              tick={(props) => {
                const { x, y, payload } = props;
                const label =
                  (
                    chartConfig[payload.value as keyof typeof chartConfig] as {
                      label?: string;
                    }
                  )?.label ?? payload.value;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={10}
                    textAnchor="end"
                    transform={`rotate(-35, ${x}, ${y})`}
                    fontSize={11}
                    fill="var(--muted-foreground)"
                  >
                    {label}
                  </text>
                );
              }}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                valueFormatter
                  ? valueFormatter(value as number)
                  : (value as number).toLocaleString()
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => (
                    <div className="flex w-full flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span>
                          {valueFormatter
                            ? valueFormatter(value as number)
                            : (value as number).toLocaleString()}
                        </span>
                      </div>
                      {item.payload.extra && (
                        <span className="text-muted-foreground">
                          {item.payload.extra}
                        </span>
                      )}
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
