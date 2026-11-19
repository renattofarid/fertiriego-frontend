import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface Props {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number }>;
  valueFormatter?: (value: number) => string;
  valueLabel?: string;
  className?: string;
}

export function ChartBarMixed({
  title,
  subtitle,
  data,
  valueFormatter,
  valueLabel = "Valor",
  className,
}: Props) {
  const chartData = data.map((item, i) => ({
    key: `item_${i}`,
    label: item.name,
    value: item.value,
    fill: `var(--color-item_${i})`,
  }));

  const chartConfig = {
    value: { label: valueLabel },
    ...Object.fromEntries(
      data.map((item, i) => [
        `item_${i}`,
        { label: item.name, color: CHART_COLORS[i % CHART_COLORS.length] },
      ]),
    ),
  } satisfies ChartConfig;

  const barHeight = 40;
  const chartHeight = Math.max(200, data.length * barHeight + 20);
  // ~6.5px per character at font-size 12, plus 10px tick margin — capped at 220px
  const yAxisWidth = Math.min(
    Math.max(...data.map((d) => d.name.length)) * 10 + 10,
    220,
  );

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2 gap-1!">
        <CardTitle className="font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ height: chartHeight }}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          >
            <YAxis
              dataKey="key"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={yAxisWidth}
              tickFormatter={(value) =>
                (
                  chartConfig[value as keyof typeof chartConfig] as {
                    label?: string;
                  }
                )?.label ?? value
              }
            />
            <XAxis dataKey="value" type="number" hide domain={[0, "dataMax"]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) =>
                    valueFormatter
                      ? valueFormatter(value as number)
                      : (value as number).toLocaleString()
                  }
                />
              }
            />
            <Bar dataKey="value" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
