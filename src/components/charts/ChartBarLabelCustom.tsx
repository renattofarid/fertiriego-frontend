import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Props {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number }>;
  valueFormatter?: (value: number) => string;
  color?: string;
}

export function ChartBarLabelCustom({ title, subtitle, data, valueFormatter, color = "var(--chart-2)" }: Props) {
  const chartConfig = {
    value: {
      label: "Saldo (S/)",
      color,
    },
    label: {
      color: "var(--background)",
    },
  } satisfies ChartConfig;
  const barHeight = 36;
  const minHeight = 200;
  const chartHeight = Math.max(minHeight, data.length * barHeight + 20);

  return (
    <Card>
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
            data={data}
            layout="vertical"
            margin={{ right: 80, left: 0, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              hide
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) =>
                    valueFormatter
                      ? valueFormatter(value as number)
                      : (value as number).toLocaleString()
                  }
                />
              }
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4}>
              <LabelList
                dataKey="name"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) =>
                  valueFormatter ? valueFormatter(value) : value.toLocaleString()
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
