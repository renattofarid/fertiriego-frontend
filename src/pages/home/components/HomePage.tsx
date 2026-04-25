import { useMemo, useState } from "react";
import {
  ShoppingCart,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SalesVsPurchasesChart } from "./SalesVsPurchasesChart";
import { TopProductsChart } from "./TopProductsChart";
import { PaymentMethodsChart } from "./PaymentMethodsChart";
import FormSkeleton from "@/components/FormSkeleton";
import formatCurrency from "@/lib/formatCurrency";
import { useSaleStatistics } from "@/pages/sale/lib/sale.hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/DatePicker";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getMonthRange(year: number, month: number) {
  return {
    from: format(new Date(year, month, 1), "yyyy-MM-dd"),
    to: format(new Date(year, month + 1, 0), "yyyy-MM-dd"),
  };
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  variant,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  variant: "blue" | "orange" | "gray" | "green";
}) {
  const variantStyles = {
    blue: "bg-blue-50 dark:bg-blue-900/10",
    orange: "bg-orange-50 dark:bg-orange-900/10",
    gray: "bg-gray-50 dark:bg-gray-900/10",
    green: "bg-emerald-50 dark:bg-emerald-900/10",
  };
  const iconBgStyles = {
    blue: "bg-blue-100 dark:bg-blue-800",
    orange: "bg-orange-100 dark:bg-orange-800",
    gray: "bg-gray-100 dark:bg-gray-800",
    green: "bg-emerald-100 dark:bg-emerald-800",
  };
  const textStyles = {
    blue: "text-blue-700 dark:text-blue-400",
    orange: "text-orange-700 dark:text-orange-400",
    gray: "text-gray-700 dark:text-gray-400",
    green: "text-emerald-700 dark:text-emerald-400",
  };

  return (
    <div className={cn("rounded-lg p-3", variantStyles[variant])}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-md shrink-0", iconBgStyles[variant])}>
          <Icon className={cn("h-5 w-5", textStyles[variant])} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{title}</p>
          <p className={cn("text-xl font-bold mb-0.5", textStyles[variant])}>{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isCustom, setIsCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);

  const dateRange = useMemo(() => {
    if (isCustom && customFrom && customTo) {
      return {
        from: format(customFrom, "yyyy-MM-dd"),
        to: format(customTo, "yyyy-MM-dd"),
      };
    }
    return getMonthRange(selectedYear, selectedMonth);
  }, [isCustom, customFrom, customTo, selectedYear, selectedMonth]);

  const { data: statsResponse, isLoading: statsLoading } = useSaleStatistics(
    dateRange.from,
    dateRange.to,
  );
  const stats = statsResponse?.data;

  const totalVentas = stats?.ventas.total ?? 0;
  const totalCompras = stats?.compras.total ?? 0;
  const balance = totalVentas - totalCompras;

  const ventasContado = stats?.metodos_pago.ventas.find(
    (v) => v.payment_type === "CONTADO",
  );
  const ventasCredito = stats?.metodos_pago.ventas.find(
    (v) => v.payment_type === "CREDITO",
  );
  const totalVentasCount = (stats?.metodos_pago.ventas ?? []).reduce(
    (sum, v) => sum + v.cantidad,
    0,
  );
  const totalComprasCount = (stats?.metodos_pago.compras ?? []).reduce(
    (sum, v) => sum + v.cantidad,
    0,
  );
  const averageTicket =
    totalVentasCount > 0 ? totalVentas / totalVentasCount : 0;

  const transactionsByDate = useMemo(() => {
    return (stats?.comparativo_por_fecha ?? []).map((item) => ({
      label: item.fecha,
      ventas: item.ventas,
      compras: item.compras,
    }));
  }, [stats]);

  const currentYearRange = useMemo(() => {
    const base = now.getFullYear();
    return [base - 2, base - 1, base, base + 1];
  }, []);

  const isLoading = statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header + filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Resumen general de tu negocio
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isCustom ? (
            <>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger className="w-[130px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-[90px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentYearRange.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <DatePicker
                value={customFrom}
                onChange={(d) => setCustomFrom(d)}
                placeholder="Desde"
                showClearButton={false}
                className="w-[150px] [&>button]:h-8 [&>button]:text-sm"
              />
              <span className="text-muted-foreground text-sm">—</span>
              <DatePicker
                value={customTo}
                onChange={(d) => setCustomTo(d)}
                placeholder="Hasta"
                showClearButton={false}
                disabledRange={customFrom ? { before: customFrom } : undefined}
                className="w-[150px] [&>button]:h-8 [&>button]:text-sm"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setIsCustom(!isCustom);
              setCustomFrom(undefined);
              setCustomTo(undefined);
            }}
          >
            {isCustom ? "Por mes" : "Personalizar"}
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Ventas"
          value={`S/ ${formatCurrency(totalVentas)}`}
          description={`${totalVentasCount} transacciones`}
          icon={ShoppingBag}
          variant="blue"
        />
        <MetricCard
          title="Total Compras"
          value={`S/ ${formatCurrency(totalCompras)}`}
          description={`${totalComprasCount} órdenes`}
          icon={ShoppingCart}
          variant="orange"
        />
        <MetricCard
          title="Balance Neto"
          value={`S/ ${formatCurrency(balance)}`}
          description={`Margen: ${
            totalVentas > 0 ? ((balance / totalVentas) * 100).toFixed(1) : "0"
          }%`}
          icon={DollarSign}
          variant={balance >= 0 ? "green" : "orange"}
        />
        <MetricCard
          title="Ventas al Contado"
          value={`S/ ${formatCurrency(parseFloat(ventasContado?.monto_total ?? "0"))}`}
          description={`${ventasContado?.cantidad ?? 0} trans. · ${
            totalVentas > 0
              ? (
                  (parseFloat(ventasContado?.monto_total ?? "0") / totalVentas) *
                  100
                ).toFixed(0)
              : 0
          }% del total`}
          icon={TrendingUp}
          variant="blue"
        />
        <MetricCard
          title="Ventas al Crédito"
          value={`S/ ${formatCurrency(parseFloat(ventasCredito?.monto_total ?? "0"))}`}
          description={`${ventasCredito?.cantidad ?? 0} trans. · ${
            totalVentas > 0
              ? (
                  (parseFloat(ventasCredito?.monto_total ?? "0") / totalVentas) *
                  100
                ).toFixed(0)
              : 0
          }% del total`}
          icon={TrendingDown}
          variant="gray"
        />
        <MetricCard
          title="Ticket Promedio"
          value={`S/ ${formatCurrency(averageTicket)}`}
          description="Promedio por venta en el período"
          icon={Package}
          variant="gray"
        />
      </div>

      {/* Gráficos */}
      <div className="space-y-3">
        <SalesVsPurchasesChart data={transactionsByDate} />
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          <TopProductsChart
            ventasData={stats?.ventas.top_5_productos ?? []}
            comprasData={stats?.compras.top_5_productos ?? []}
          />
          <PaymentMethodsChart
            ventasMetodos={stats?.metodos_pago.ventas ?? []}
            comprasMetodos={stats?.metodos_pago.compras ?? []}
          />
        </div>
      </div>
    </div>
  );
}
