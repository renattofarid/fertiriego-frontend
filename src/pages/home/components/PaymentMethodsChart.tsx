"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaymentMethodData {
  name: string;
  value: number;
  fill?: string;
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
}

const chartConfig = {
  value: {
    label: "Ventas",
  },
  contado: {
    label: "CONTADO",
    color: "var(--chart-1)",
  },
  credito: {
    label: "CREDITO",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const id = "payment-methods-chart"

  // Transform data to include fill property based on name
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: `var(--color-${item.name.toLowerCase()})`,
    }))
  }, [data])

  const [activeMethod, setActiveMethod] = React.useState(
    chartData.length > 0 ? chartData[0].name : ""
  )

  // Actualizar activeMethod cuando chartData cambie y esté vacío
  React.useEffect(() => {
    if (chartData.length > 0 && !activeMethod) {
      setActiveMethod(chartData[0].name);
    }
  }, [chartData, activeMethod]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.name === activeMethod),
    [activeMethod, chartData]
  )

  const methods = React.useMemo(() => chartData.map((item) => item.name), [chartData])

  if (data.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">
            Distribución de Métodos de Pago
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Ventas por tipo de pago
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            No hay datos de métodos de pago
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col border-none shadow-md">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-3">
        <div className="grid gap-1">
          <CardTitle className="text-base md:text-lg">
            Distribución de Métodos de Pago
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Ventas por tipo de pago
          </CardDescription>
        </div>
        <Select value={activeMethod} onValueChange={setActiveMethod}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Seleccionar método de pago"
          >
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {methods.map((key) => {
              const config = chartConfig[key.toLowerCase() as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key.toLowerCase()})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0 px-4 md:px-6">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
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
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const currentData = chartData[activeIndex >= 0 ? activeIndex : 0];
                    if (!currentData) return null;

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
                          {currentData.value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {currentData.name}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
