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
import { PieChart, Pie, Cell } from "recharts";

interface PaymentMethodData {
  name: string;
  value: number;
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
}

const PIE_COLORS = ["var(--primary)", "var(--secondary)"];

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
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
        {data.length > 0 ? (
          <ChartContainer
            config={{
              contado: {
                label: "Contado",
                color: "var(--primary)",
              },
              credito: {
                label: "Crédito",
                color: "var(--secondary)",
              },
            }}
            className="h-[280px] w-full"
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            No hay datos de métodos de pago
          </div>
        )}
      </CardContent>
    </Card>
  );
}
