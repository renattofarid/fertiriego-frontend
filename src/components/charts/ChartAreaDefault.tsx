import { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const RANGE_OPTIONS = [
  { value: "3", label: "Últ. 3" },
  { value: "6", label: "Últ. 6" },
  { value: "12", label: "Últ. 12" },
  { value: "all", label: "Todo" },
];

interface DataPoint {
  name: string;
  value: number;
  value2?: number;
  [key: string]: unknown;
}

interface Props {
  title: string;
  description?: string;
  data: DataPoint[];
  valueLabel?: string;
  value2Label?: string;
  valueFormatter?: (value: number) => string;
  /** Formato (más corto) para los ticks del eje Y. Por defecto usa valueFormatter. */
  axisFormatter?: (value: number) => string;
  /** Rango inicial ("3", "6", "12" o "all"). Por defecto "12" si hay datos suficientes. */
  defaultRange?: string;
  /** Muestra el eje Y a la izquierda con los valores de referencia. Ajusta el rango a los datos en vez de partir de 0. */
  showYAxis?: boolean;
  /** Dibuja un punto en cada dato de la serie principal. */
  showDots?: boolean;
  /** Ocupa toda la altura del contenedor (útil al alinear con otra tarjeta en un grid). Mínimo 250px. */
  fillHeight?: boolean;
  /** Se llama con el DataPoint completo al hacer clic en un punto de la serie principal (requiere showDots). */
  onPointClick?: (point: DataPoint) => void;
}

export function ChartAreaDefault({
  title,
  description,
  data,
  valueLabel = "Valor",
  value2Label = "Valor 2",
  valueFormatter,
  axisFormatter,
  defaultRange: defaultRangeProp,
  showYAxis = false,
  showDots = false,
  fillHeight = false,
  onPointClick,
}: Props) {
  const id = useId();
  const hasSecondSeries = data.some((d) => d.value2 !== undefined);

  const availableRanges = RANGE_OPTIONS.filter(
    (opt) => opt.value === "all" || parseInt(opt.value) < data.length,
  );

  const defaultRange =
    availableRanges.find((o) => o.value === (defaultRangeProp ?? "12")) ??
    availableRanges[availableRanges.length - 1];

  const [range, setRange] = useState(defaultRange?.value ?? "all");

  const visibleData =
    range === "all" ? data : data.slice(-parseInt(range));

  const config = {
    value: { label: valueLabel, color: "var(--primary)" },
    ...(hasSecondSeries
      ? { value2: { label: value2Label, color: "var(--chart-3)" } }
      : {}),
  } satisfies ChartConfig;

  const fillId1 = `fill-value-${id}`;
  const fillId2 = `fill-value2-${id}`;

  // Como función en vez de objeto de props: así recibimos `payload` (el
  // DataPoint completo) para pasárselo a onPointClick. Con el dot como
  // objeto plano, recharts solo reenvía el evento del DOM al onClick.
  const renderDot = (radius: number) => (props: any) => {
    const { cx, cy, payload, index } = props;
    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={radius}
        fill="var(--color-value)"
        stroke="var(--background)"
        strokeWidth={2}
        style={onPointClick ? { cursor: "pointer" } : undefined}
        onClick={() => onPointClick?.(payload)}
      />
    );
  };

  return (
    <Card className={cn("pt-0", fillHeight && "h-full")}>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {availableRanges.length > 1 && (
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger
              className="hidden w-[140px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Seleccionar rango"
            >
              <SelectValue placeholder="Rango" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {availableRanges.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-lg"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent
        className={cn(
          "px-2 pt-4 sm:px-6 sm:pt-6",
          fillHeight && "flex flex-1 flex-col",
        )}
      >
        <ChartContainer
          config={config}
          className={cn(
            "aspect-auto w-full",
            fillHeight ? "min-h-[250px] flex-1" : "h-[250px]",
          )}
        >
          <AreaChart data={visibleData}>
            <defs>
              <linearGradient id={fillId1} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              {hasSecondSeries && (
                <linearGradient id={fillId2} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            {showYAxis && (
              <YAxis
                width={72}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[
                  (min: number) => Math.floor(min * 0.9),
                  (max: number) => Math.ceil(max * 1.05),
                ]}
                tickFormatter={(value: number) =>
                  axisFormatter
                    ? axisFormatter(value)
                    : valueFormatter
                      ? valueFormatter(value)
                      : value.toLocaleString()
                }
              />
            )}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) =>
                    valueFormatter
                      ? valueFormatter(value as number)
                      : (value as number).toLocaleString()
                  }
                />
              }
            />
            {hasSecondSeries && (
              <Area
                dataKey="value2"
                type="natural"
                fill={`url(#${fillId2})`}
                stroke="var(--color-value2)"
                stackId="a"
              />
            )}
            <Area
              dataKey="value"
              type="natural"
              fill={`url(#${fillId1})`}
              stroke="var(--color-value)"
              stackId="a"
              dot={showDots ? renderDot(4) : false}
              activeDot={showDots ? renderDot(6) : undefined}
            />
            {hasSecondSeries && <ChartLegend content={<ChartLegendContent />} />}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
