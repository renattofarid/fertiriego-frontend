import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

// Componente reutilizable para gráficos pie interactivos
interface Props {
  id: string;
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number; fill: string }>;
  config: ChartConfig;
  valueLabel?: string;
  showCenterLabel?: boolean;
  centerLabelAsPercent?: boolean;
  showLegend?: boolean;
  showPercentageInLegend?: boolean;
  showSelectionFooter?: boolean;
  valueFormatter?: (value: number) => string;
  footerInfo?: {
    label: string;
    value: string | number;
    trend?: string;
    icon?: React.ReactNode;
  };
  /** Notifica al padre cuando cambia el item activo (clic en el gráfico o Select), sin alterar el comportamiento interno del componente. */
  onActiveItemChange?: (name: string) => void;
  className?: string;
}

export function InteractivePieChart({
  id,
  title,
  subtitle,
  data,
  config,
  valueLabel = "Cantidad",
  showCenterLabel = true,
  centerLabelAsPercent = false,
  showLegend = false,
  showPercentageInLegend = false,
  showSelectionFooter = false,
  valueFormatter,
  footerInfo,
  onActiveItemChange,
  className,
}: Props) {
  const [activeItem, setActiveItemState] = useState(data[0]?.name || "");
  const setActiveItem = (name: string) => {
    setActiveItemState(name);
    onActiveItemChange?.(name);
  };

  const activeIndex = useMemo(
    () => data.findIndex((item) => item.name === activeItem),
    [activeItem, data],
  );

  const items = useMemo(() => data.map((item) => item.name), [data]);

  return (
    <Card data-chart={id} className={cn("flex flex-col h-full", className)}>
      <ChartStyle id={id} config={config} />
      <CardHeader className="flex flex-wrap gap-2 items-center space-y-0 pb-2">
        <div className="flex flex-col gap-2 w-fit">
          <CardTitle>{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-fit rounded-lg pl-2.5"
            aria-label="Selecciona un valor"
          >
            <SelectValue placeholder="Selecciona" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {items.map((key) => {
              const itemConfig = config[key as keyof typeof config];

              if (!itemConfig) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: itemConfig.color,
                      }}
                    />
                    {itemConfig?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={config}
          className="mx-auto aspect-square w-full max-w-56"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              onClick={(_, index) => {
                const clickedItem = data[index];
                if (clickedItem) {
                  setActiveItem(clickedItem.name);
                }
              }}
              className="cursor-pointer"
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              {showCenterLabel && (
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const activeValue = data[activeIndex]?.value ?? 0;
                      const total = data.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      );
                      const centerText = centerLabelAsPercent
                        ? `${total > 0 ? ((activeValue / total) * 100).toFixed(1) : "0.0"}%`
                        : activeValue.toLocaleString();
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
                            className="fill-foreground text-3xl font-bold"
                          >
                            {centerText}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {centerLabelAsPercent
                              ? (config[data[activeIndex]?.name ?? ""]?.label ??
                                data[activeIndex]?.name ??
                                valueLabel)
                              : valueLabel}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              )}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="flex flex-col gap-4">
        {showLegend && (
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {(showPercentageInLegend
              ? [...data].sort((a, b) => b.value - a.value)
              : data
            ).map((item) => {
              const total = data.reduce((sum, d) => sum + d.value, 0);
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: `var(--color-${item.name})` }}
                  />
                  <span className="text-muted-foreground">
                    {config[item.name]?.label || item.name}
                  </span>
                  {showPercentageInLegend && (
                    <strong className="font-mono">
                      {percentage.toFixed(0)}%
                    </strong>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {footerInfo ? (
          <CardFooter className="flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              {footerInfo.label}: {footerInfo.value}
              {footerInfo.icon}
            </div>
            {footerInfo.trend && (
              <div className="text-muted-foreground text-xs">
                {footerInfo.trend}
              </div>
            )}
          </CardFooter>
        ) : showSelectionFooter && data[activeIndex] ? (
          <CardFooter className="flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              {config[data[activeIndex].name]?.label || data[activeIndex].name}
              {": "}
              {valueFormatter
                ? valueFormatter(data[activeIndex].value)
                : data[activeIndex].value.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">
              Representa el{" "}
              <strong>
                {(
                  (data[activeIndex].value /
                    data.reduce((sum, item) => sum + item.value, 0)) *
                  100
                ).toFixed(1)}
                %
              </strong>{" "}
              del total (
              {valueFormatter
                ? valueFormatter(
                    data.reduce((sum, item) => sum + item.value, 0),
                  )
                : data
                    .reduce((sum, item) => sum + item.value, 0)
                    .toLocaleString()}
              )
            </div>
          </CardFooter>
        ) : null}
      </div>
    </Card>
  );
}
