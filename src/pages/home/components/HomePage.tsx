import { useEffect, useState } from "react";
import { ShoppingCart, TrendingUp, ShoppingBag, DollarSign, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SalesVsPurchasesChart } from "./SalesVsPurchasesChart";
import { TopProductsChart } from "./TopProductsChart";
import { PaymentMethodsChart } from "./PaymentMethodsChart";
import { NotasVentaPie } from "./NotasVentaPie";
import { TotalesChart } from "./TotalesChart";
import FormSkeleton from "@/components/FormSkeleton";
import formatCurrency from "@/lib/formatCurrency";

// Componente de métrica simple
function MetricCard({ title, value, description, icon: Icon, variant }: { title: string; value: string; description: string; icon: React.ElementType; variant: "blue" | "orange" | "gray" | "green"; }) {
  const variantStyles = { blue: "bg-blue-50 dark:bg-blue-900/10", orange: "bg-orange-50 dark:bg-orange-900/10", gray: "bg-gray-50 dark:bg-gray-900/10", green: "bg-emerald-50 dark:bg-emerald-900/10" };
  const iconBgStyles = { blue: "bg-blue-100 dark:bg-blue-800", orange: "bg-orange-100 dark:bg-orange-800", gray: "bg-gray-100 dark:bg-gray-800", green: "bg-emerald-100 dark:bg-emerald-800" };
  const textStyles = { blue: "text-blue-700 dark:text-blue-400", orange: "text-orange-700 dark:text-orange-400", gray: "text-gray-700 dark:text-gray-400", green: "text-emerald-700 dark:text-emerald-400" };

  return (
    <div className={cn("rounded-lg p-3", variantStyles[variant])}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-md shrink-0", iconBgStyles[variant])}><Icon className={cn("h-5 w-5", textStyles[variant])} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{title}</p>
          <p className={cn("text-xl font-bold mb-0.5", textStyles[variant])}>{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

const safeArray = (data: any) => {
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
};

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Fechas iniciales
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
  const currentDate = today.toISOString().slice(0, 10);

  // Filtros visuales
  const [selectedStore, setSelectedStore] = useState("Tienda Modelo");
  const [filterType, setFilterType] = useState("Por mes");
  const [filterDate, setFilterDate] = useState(currentMonth);
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [startMonth, setStartMonth] = useState(currentMonth);
  const [endMonth, setEndMonth] = useState(currentMonth);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let url = `${baseUrl}sale/statistics`;
      
      const params = new URLSearchParams();

      // branch_id (1 = Tienda Modelo, 2 = Sede Principal)
      const branchId = selectedStore === "Tienda Modelo" ? "1" : "2";
      params.append("branch_id", branchId);
      
      // Lógica de Fechas
      if (filterType === "Última semana") {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        params.append("from", lastWeek.toISOString().slice(0, 10));
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

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      
      if (json.success && json.data) {
        setDashboardData(json.data);
      } else {
        setDashboardData(null); 
      }

    } catch (error) {
      console.error("Error conectando al backend:", error);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterDate, startDate, endDate, selectedStore, startMonth, endMonth]);

  if (isFirstLoad) {
    return <div className="flex items-center justify-center h-full"><FormSkeleton /></div>;
  }

  // Extracción segura de datos
  const totalVentas = Number(dashboardData?.ventas?.total || 0);
  const totalCompras = Number(dashboardData?.compras?.total || 0);
  const balanceNeto = Number(dashboardData?.compras_vs_ventas?.diferencia || 0);
  
  const totalGeneral = Number(dashboardData?.totales?.monto_total || 0);
  const totalCobrado = Number(dashboardData?.totales?.monto_cobrado || 0);
  const totalPendiente = Number(dashboardData?.totales?.monto_pendiente || 0);

  // Formateos súper blindados
  const chartLines = safeArray(dashboardData?.comparativo_por_fecha).map((dia: any) => ({
    date: dia.fecha || "Sin fecha",
    compras: Number(dia.compras || 0),
    ventas: Number(dia.ventas || 0)
  }));

  const chartTop5 = safeArray(dashboardData?.ventas?.top_5_productos).map((p: any) => ({
    name: String(p.producto || p.name || "Producto"),
    quantity: Number(p.cantidad || p.quantity || 0),
    revenue: Number(p.monto_total || p.revenue || p.total || 0)
  }));

  const chartPayment = safeArray(dashboardData?.metodos_pago?.ventas).map((m: any) => ({
    name: String(m.payment_type || m.metodo || "Otros"),
    value: Number(m.monto_total || m.cantidad || 0),
    fill: String(m.payment_type).toUpperCase() === "CONTADO" ? "#3b82f6" : "#f87171"
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen general de tu negocio</p>
      </div>

      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-6 relative z-20">
        <div className="flex flex-col sm:flex-row gap-4 items-center relative z-30">
          <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="flex h-10 w-full sm:w-[200px] items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring">
            <option value="Tienda Modelo">Tienda Modelo</option>
            <option value="Sede Principal">Sede Principal</option>
          </select>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="flex h-10 w-full sm:w-[200px] items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring">
            <option value="Todos">Todos</option>
            <option value="Última semana">Última semana</option>
            <option value="Por mes">Por mes</option>
            <option value="Entre meses">Entre meses</option>
            <option value="Por fecha">Por fecha</option>
            <option value="Entre fechas">Entre fechas</option>
          </select>

          {filterType === "Por mes" && <input type="month" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm" />}
          {filterType === "Entre meses" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <span className="text-muted-foreground font-medium">-</span>
              <input type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          )}
          {filterType === "Por fecha" && <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm" />}
          {filterType === "Entre fechas" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <span className="text-muted-foreground font-medium">-</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          )}
        </div>

        <div className={cn("transition-opacity duration-200", isLoading && !isFirstLoad ? "opacity-40 pointer-events-none" : "opacity-100")}>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 relative z-10">
            <div className="rounded-lg border bg-background p-5">
              <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-4">Estado de Cobranza</h3>
              <NotasVentaPie collected={totalCobrado} pending={totalPendiente} />
            </div>
            <div className="rounded-lg border bg-background p-5">
              <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-4">Resumen General</h3>
              <TotalesChart totalSales={totalGeneral} collected={totalCobrado} />
            </div>
          </div>
        </div>
      </div>

      <div className={cn("transition-opacity duration-200", isLoading && !isFirstLoad ? "opacity-40 pointer-events-none" : "opacity-100")}>
        <div className="space-y-3 pt-4 border-t">
          <h2 className="text-base font-semibold">Métricas Principales</h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard title="Total Ventas" value={`S/ ${formatCurrency(totalVentas)}`} description="Ingresos totales" icon={ShoppingBag} variant="blue" />
            <MetricCard title="Total Compras" value={`S/ ${formatCurrency(totalCompras)}`} description="Gastos totales" icon={ShoppingCart} variant="orange" />
            <MetricCard title="Balance Neto" value={`S/ ${formatCurrency(balanceNeto)}`} description="Margen de diferencia" icon={DollarSign} variant={balanceNeto >= 0 ? "green" : "orange"} />
            <MetricCard title="Pendiente de Cobro" value={`S/ ${formatCurrency(totalPendiente)}`} description="Dinero por ingresar" icon={TrendingUp} variant="blue" />
            <MetricCard title="Cuentas por Pagar" value={`S/ 0.00`} description="Pendiente de API" icon={TrendingDown} variant="orange" />
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <h2 className="text-base font-semibold">Análisis Visual</h2>
          <SalesVsPurchasesChart data={chartLines} />
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <TopProductsChart data={chartTop5} />
            <PaymentMethodsChart data={chartPayment} />
          </div>
        </div>
      </div>
    </div>
  );
}