import { useEffect, useState, useMemo, useCallback } from "react";
import { ShoppingCart, TrendingUp, ShoppingBag, DollarSign, TrendingDown, Sprout } from "lucide-react";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { hasAccessToRoute } from "@/lib/route-access";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { SearchableSelect } from "@/components/SearchableSelect";
import { ChartAreaDefault } from "@/components/charts/ChartAreaDefault";
import { ChartBarMixed } from "@/components/charts/ChartBarMixed";
import { ChartBarVertical } from "@/components/charts/ChartBarVertical";
import { InteractivePieChart } from "@/components/charts/InteractivePieChart";
import type { ChartConfig } from "@/components/ui/chart";
import TitleComponent from "@/components/TitleComponent";
import MonthPicker from "@/components/MonthPicker";
import DatePicker from "@/components/DatePicker";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import FormSkeleton from "@/components/FormSkeleton";
import formatCurrency from "@/lib/formatCurrency";

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "Soles (S/)" },
  { value: "USD", label: "Dólares ($)" },
  { value: "EUR", label: "Euros (€)" },
];

const FILTER_TYPE_OPTIONS = ["Todos", "Última semana", "Por mes", "Entre meses", "Por fecha", "Entre fechas"].map(
  (v) => ({ value: v, label: v }),
);

const PAYMENT_COLORS = ["#3b82f6", "#f97316", "#8b5cf6", "#14b8a6", "#eab308"];

const safeArray = (data: any) => {
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
};

// Ruta del permiso que habilita ver el dashboard en el inicio.
export const DASHBOARD_PERMISSION_ROUTE = "dashboard";

const MOTIVATIONAL_MESSAGES = [
  "Cada pequeño avance cuenta. ¡Hoy es un gran día para lograrlo!",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Tu trabajo hace crecer este equipo. ¡Gracias por estar aquí!",
  "Lo que siembras hoy, lo cosechas mañana. ¡Adelante!",
  "La constancia vence lo que la dicha no alcanza.",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function WelcomeHome({ name }: { name?: string }) {
  const message = useMemo(
    () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
    []
  );

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-4 md:p-6">
      <div className="max-w-xl text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sprout className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {getGreeting()}{name ? `, ${name}` : ""} 👋
        </h1>
        <p className="text-lg text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          Usa el menú lateral para acceder a tus módulos.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, access } = useAuthStore();

  const canSeeDashboard =
    !ENABLE_PERMISSION_VALIDATION ||
    user?.rol_id === 1 ||
    (!!access && hasAccessToRoute(access, DASHBOARD_PERMISSION_ROUTE));

  if (!canSeeDashboard) {
    return <WelcomeHome name={user?.name} />;
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

 const { currentMonth, currentDate } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return {
      currentMonth: `${year}-${month}`,
      currentDate: `${year}-${month}-${day}`
    };
  }, []);

  // Filtros visuales
  const [filterType, setFilterType] = useState("Por mes");
  const [filterDate, setFilterDate] = useState(currentMonth);
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [startMonth, setStartMonth] = useState(currentMonth);
  const [endMonth, setEndMonth] = useState(currentMonth);

  const [currency , setCurrency] = useState("PEN");
  const symbol = useMemo(() => {
    const currencySymbols: Record<string, string> = { PEN: "S/", USD: "$", EUR: "€" };
    return currencySymbols[currency] || "S/";
  }, [currency]);

    const fetchBranches = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${baseUrl}branch`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      const json = await response.json();
      if (json.data && json.data.length > 0) {
        setBranches(json.data);
        const principal = json.data.find((b: any) =>
          /principal/i.test(String(b.name ?? "")),
        );
        setSelectedBranchId(String((principal ?? json.data[0]).id));
      } else {
        setIsLoading(false);
        setIsFirstLoad(false);
      }
    } catch (error) {
      console.error("Error conectando a la API de branches:", error);
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    if (!selectedBranchId) return; 
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let url = `${baseUrl}sale/statistics`;
      
      const params = new URLSearchParams();
      params.append("branch_id", selectedBranchId);
      params.append("currency", currency);
      
      if (filterType === "Última semana") {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lwYear = lastWeek.getFullYear();
        const lwMonth = String(lastWeek.getMonth() + 1).padStart(2, '0');
        const lwDay = String(lastWeek.getDate()).padStart(2, '0');
        params.append("from", `${lwYear}-${lwMonth}-${lwDay}`);
        params.append("to", currentDate);
      } else if (filterType === "Por mes" && filterDate) {
        const [year, month] = filterDate.split("-");
        const lastDay = new Date(Number(year), Number(month), 0).getDate();
        params.append("from", `${filterDate}-01`);
        params.append("to", `${filterDate}-${lastDay}`);
      } else if (filterType === "Entre meses" && startMonth && endMonth) {
        const [endYear, endMonthNum] = endMonth.split("-");
        const lastDayOfEndMonth = new Date(Number(endYear), Number(endMonthNum), 0).getDate();
        params.append("from", `${startMonth}-01`);
        params.append("to", `${endMonth}-${lastDayOfEndMonth}`);
      } else if (filterType === "Por fecha" && startDate) {
        params.append("from", startDate);
        params.append("to", startDate);
      } else if (filterType === "Entre fechas" && startDate && endDate) {
        params.append("from", startDate);
        params.append("to", endDate);
      }
      
      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const json = await response.json();
      
      setDashboardData(json.success && json.data ? json.data : null);
    } catch (error) {
      console.error("Error conectando al backend:", error);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }, [filterType, filterDate, startDate, endDate, selectedBranchId, startMonth, endMonth, currency, currentDate]); 

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);


  const { totalVentas, totalCompras, balanceNeto, totalGeneral, totalCobrado, totalPendiente } = useMemo(() => {
    return {
      totalVentas: Number(dashboardData?.ventas?.total || 0),
      totalCompras: Number(dashboardData?.compras?.total || 0),
      balanceNeto: Number(dashboardData?.compras_vs_ventas?.diferencia || 0),
      totalGeneral: Number(dashboardData?.totales?.monto_total || 0),
      totalCobrado: Number(dashboardData?.totales?.monto_cobrado || 0),
      totalPendiente: Number(dashboardData?.totales?.monto_pendiente || 0)
    };
  }, [dashboardData]);

  const chartLines = useMemo(() => {
    return safeArray(dashboardData?.comparativo_por_fecha).map((dia: any) => ({
      date: dia.fecha || "Sin fecha",
      compras: Number(dia.compras || 0),
      ventas: Number(dia.ventas || 0)
    }));
  }, [dashboardData]);

  const chartTop5 = useMemo(() => {
    return safeArray(dashboardData?.ventas?.top_5_productos).map((p: any) => ({
      name: String(p.name || "Desconocido"),
      quantity: Number(p.total_cantidad || 0),
      revenue: Number(p.total_vendido || 0)
    }));
  }, [dashboardData]);

  const chartPayment = useMemo(() => {
    return safeArray(dashboardData?.metodos_pago?.ventas).map((m: any) => ({
      name: String(m.payment_type || m.metodo || "Otros"),
      value: Number(m.monto_total || m.cantidad || 0),
      fill: String(m.payment_type).toUpperCase() === "CONTADO" ? "#3b82f6" : "#f87171"
    }));
  }, [dashboardData]);

  if (isFirstLoad) {
    return <div className="flex items-center justify-center h-full"><FormSkeleton /></div>;
  }

  const money = (v: number) => `${symbol} ${formatCurrency(v)}`;

  const cobranzaData = [
    { name: "cobrado", value: totalCobrado, fill: "var(--color-cobrado)" },
    { name: "pendiente", value: totalPendiente, fill: "var(--color-pendiente)" },
  ];
  const cobranzaConfig: ChartConfig = {
    cobrado: { label: "Cobrado", color: "var(--primary)" },
    pendiente: { label: "Pendiente de cobro", color: "#f97316" },
  };

  const resumenData = [
    { name: "Total", value: totalGeneral },
    { name: "Cobrado", value: totalCobrado },
    { name: "Pendiente", value: totalPendiente },
  ];

  const paymentData = chartPayment.map((p, i) => ({
    name: `pago_${i}`,
    value: p.value,
    fill: `var(--color-pago_${i})`,
  }));
  const paymentConfig: ChartConfig = Object.fromEntries(
    chartPayment.map((p, i) => [
      `pago_${i}`,
      { label: p.name, color: PAYMENT_COLORS[i % PAYMENT_COLORS.length] },
    ]),
  );

  const busy = isLoading && !isFirstLoad;
  const rise = (n: number) => ({ "--i": n }) as React.CSSProperties;

  const kpis = [
    { title: "Total ventas", value: totalVentas, description: "Ingresos totales", icon: ShoppingBag, tone: "text-primary", valueTone: "" },
    { title: "Total compras", value: totalCompras, description: "Gastos totales", icon: ShoppingCart, tone: "text-orange-500", valueTone: "" },
    { title: "Balance neto", value: balanceNeto, description: "Margen de diferencia", icon: DollarSign, tone: balanceNeto >= 0 ? "text-emerald-500" : "text-red-500", valueTone: balanceNeto >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400" },
    { title: "Pendiente de cobro", value: totalPendiente, description: "Dinero por ingresar", icon: TrendingUp, tone: "text-blue-500", valueTone: "" },
    { title: "Cuentas por pagar", value: 0, description: "Pendiente de API", icon: TrendingDown, tone: "text-muted-foreground", valueTone: "text-muted-foreground" },
  ];

  const branchOptions = branches.map((b) => ({ value: String(b.id), label: b.name as string }));

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="dash-rise space-y-4" style={rise(0)}>
        <TitleComponent
          title="Dashboard"
          subtitle="Resumen general de tu negocio"
          icon="LayoutDashboard"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchableSelect
            options={branchOptions}
            value={selectedBranchId}
            onChange={(v) => v && setSelectedBranchId(v)}
            placeholder={branches.length === 0 ? "Cargando sucursales..." : "Sucursal"}
            className="w-full sm:w-[190px]"
          />
          <SearchableSelect
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={(v) => v && setCurrency(v)}
            placeholder="Moneda"
            className="w-full sm:w-[150px]"
          />
          <SearchableSelect
            options={FILTER_TYPE_OPTIONS}
            value={filterType}
            onChange={(v) => v && setFilterType(v)}
            placeholder="Periodo"
            className="w-full sm:w-[160px]"
          />

          {filterType === "Por mes" && (
            <MonthPicker
              value={filterDate}
              onChange={setFilterDate}
              className="w-full sm:w-[190px]"
            />
          )}
          {filterType === "Entre meses" && (
            <div className="flex items-center gap-2">
              <MonthPicker
                short
                value={startMonth}
                onChange={setStartMonth}
                className="w-full sm:w-[150px]"
              />
              <span className="text-muted-foreground">–</span>
              <MonthPicker
                short
                value={endMonth}
                onChange={setEndMonth}
                className="w-full sm:w-[150px]"
              />
            </div>
          )}
          {filterType === "Por fecha" && (
            <DatePicker
              value={startDate}
              onChange={(d) => d && setStartDate(format(d, "yyyy-MM-dd"))}
              showClearButton={false}
              className="w-full sm:w-[190px]"
            />
          )}
          {filterType === "Entre fechas" && (
            <DateRangePickerFilter
              dateFrom={startDate ? parseISO(startDate) : undefined}
              dateTo={endDate ? parseISO(endDate) : undefined}
              onDateChange={(from, to) => {
                if (from) setStartDate(format(from, "yyyy-MM-dd"));
                if (to) setEndDate(format(to, "yyyy-MM-dd"));
              }}
              className="w-full sm:w-[260px]"
            />
          )}
        </div>
      </div>

      <div className={cn("space-y-5 transition-opacity duration-200", busy ? "pointer-events-none opacity-50" : "opacity-100")}>
        {/* KPIs: franja única con filetes */}
        <div className="dash-rise overflow-hidden rounded-xl border bg-border" style={rise(1)}>
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((k) => (
              <div key={k.title} className="bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-muted-foreground">{k.title}</p>
                  <k.icon className={cn("size-4 shrink-0", k.tone)} strokeWidth={1.75} />
                </div>
                <p className={cn("mt-2 truncate text-2xl font-semibold leading-none tracking-tight tabular-nums", k.valueTone)}>
                  <span className="mr-1 text-base font-medium text-muted-foreground">{symbol}</span>
                  {formatCurrency(k.value)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{k.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="dash-rise" style={rise(2)}>
            <InteractivePieChart
              id="pie-cobranza"
              title="Estado de cobranza"
              subtitle="Cobrado vs pendiente de cobro"
              data={cobranzaData}
              config={cobranzaConfig}
              valueLabel={symbol}
              centerLabelAsPercent
              showLegend
              showPercentageInLegend
              showSelectionFooter
              valueFormatter={money}
            />
          </div>
          <div className="dash-rise" style={rise(3)}>
            <ChartBarMixed
              title="Resumen general"
              subtitle="Total facturado, cobrado y pendiente"
              data={resumenData}
              valueFormatter={money}
              valueLabel={symbol}
            />
          </div>
        </div>

        <div className="dash-rise space-y-3" style={rise(4)}>
          <ChartAreaDefault
            title="Compras vs Ventas"
            description="Comparación de montos en el periodo seleccionado"
            data={chartLines.map((d) => ({
              name: d.date,
              value: d.ventas,
              value2: d.compras,
            }))}
            valueLabel="Ventas"
            value2Label="Compras"
            valueFormatter={money}
            axisFormatter={(v) =>
              new Intl.NumberFormat("es-PE", { notation: "compact", maximumFractionDigits: 1 }).format(v)
            }
            showYAxis
            defaultRange="all"
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ChartBarVertical
              title="Top 5 productos"
              subtitle="Mayor monto vendido"
              data={chartTop5.map((p) => ({
                name: p.name.length > 22 ? `${p.name.slice(0, 21)}…` : p.name,
                value: p.revenue,
                extra: `${p.quantity.toLocaleString("es-PE")} unidades`,
              }))}
              valueFormatter={money}
              valueLabel="Vendido"
            />
            <InteractivePieChart
              id="pie-pagos"
              title="Métodos de pago"
              subtitle="Distribución de ventas por tipo de pago"
              data={paymentData}
              config={paymentConfig}
              valueLabel={symbol}
              centerLabelAsPercent
              showLegend
              showPercentageInLegend
              showSelectionFooter
              valueFormatter={money}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
