import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { usePurchase } from "@/pages/purchase/lib/purchase.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { data: purchases, isLoading: purchasesLoading } = usePurchase();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  // Estados para las estadísticas
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalPurchaseAmount: 0,
    pendingAmount: 0,
    totalProducts: 0,
    paidPurchases: 0,
    pendingPurchases: 0,
  });

  const [purchasesByMonth, setPurchasesByMonth] = useState<any[]>([]);
  const [purchasesByStatus, setPurchasesByStatus] = useState<any[]>([]);
  const [purchasesByPaymentType, setPurchasesByPaymentType] = useState<any[]>(
    []
  );

  useEffect(() => {
    if (purchases) {
      // Calcular estadísticas
      const totalAmount = purchases.reduce(
        (sum, p) => sum + parseFloat(p.total_amount),
        0
      );
      const pendingAmount = purchases.reduce(
        (sum, p) => sum + parseFloat(p.current_amount),
        0
      );
      const paidCount = purchases.filter((p) => p.status === "PAGADA").length;
      const pendingCount = purchases.filter(
        (p) => p.status === "REGISTRADO" || p.status === "PENDIENTE"
      ).length;

      setStats({
        totalPurchases: purchases.length,
        totalPurchaseAmount: totalAmount,
        pendingAmount: pendingAmount,
        totalProducts: products?.length || 0,
        paidPurchases: paidCount,
        pendingPurchases: pendingCount,
      });

      // Agrupar compras por mes
      const monthGroups: Record<string, number> = {};
      purchases.forEach((purchase) => {
        const date = new Date(purchase.issue_date);
        const monthYear = `${date.toLocaleDateString("es-ES", {
          month: "short",
        })} ${date.getFullYear()}`;
        monthGroups[monthYear] =
          (monthGroups[monthYear] || 0) + parseFloat(purchase.total_amount);
      });

      const monthData = Object.entries(monthGroups)
        .map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }))
        .slice(-6); // Últimos 6 meses

      setPurchasesByMonth(monthData);

      // Agrupar por estado
      const statusGroups: Record<string, number> = {};
      purchases.forEach((purchase) => {
        statusGroups[purchase.status] =
          (statusGroups[purchase.status] || 0) + 1;
      });

      const statusData = Object.entries(statusGroups).map(
        ([status, count]) => ({
          name: status,
          value: count,
        })
      );

      setPurchasesByStatus(statusData);

      // Agrupar por tipo de pago
      const paymentGroups: Record<string, number> = {};
      purchases.forEach((purchase) => {
        paymentGroups[purchase.payment_type] =
          (paymentGroups[purchase.payment_type] || 0) + 1;
      });

      const paymentData = Object.entries(paymentGroups).map(
        ([type, count]) => ({
          name: type,
          value: count,
        })
      );

      setPurchasesByPaymentType(paymentData);
    }
  }, [purchases, products]);

  const chartConfig = {
    total: {
      label: "Total",
      color: "var(--chart-1)",
    },
    REGISTRADO: {
      label: "Registrado",
      color: "var(--chart-2)",
    },
    PAGADA: {
      label: "Pagada",
      color: "var(--chart-1)",
    },
    PENDIENTE: {
      label: "Pendiente",
      color: "var(--chart-3)",
    },
    CONTADO: {
      label: "Contado",
      color: "var(--chart-1)",
    },
    CREDITO: {
      label: "Crédito",
      color: "var(--chart-2)",
    },
  };

  if (purchasesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Vista general de tu sistema de gestión
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.paidPurchases} pagadas, {stats.pendingPurchases} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold break-words">
              S/. {stats.totalPurchaseAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En compras realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Pendiente
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-orange-600 break-words">
              S/. {stats.pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">En el catálogo</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Compras por Mes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Compras por Mes</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Monto total de compras en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-2 md:px-6">
            {purchasesByMonth.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <ChartContainer config={chartConfig} className="h-[280px] sm:h-[300px] w-full min-w-[300px]">
                  <BarChart
                    data={purchasesByMonth}
                    margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      width={40}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="total"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[280px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Compras */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Estado de Compras</CardTitle>
            <CardDescription className="text-xs md:text-sm">Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            {purchasesByStatus.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full flex justify-center">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[200px] sm:h-[220px] md:h-[240px] w-full max-w-[280px] sm:max-w-full"
                  >
                    <PieChart>
                      <Pie
                        data={purchasesByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {purchasesByStatus.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={
                              chartConfig[entry.name as keyof typeof chartConfig]
                                ?.color || "var(--chart-1)"
                            }
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="flex justify-center gap-2 md:gap-4 flex-wrap px-2">
                  {purchasesByStatus.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1 md:gap-2">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            chartConfig[entry.name as keyof typeof chartConfig]
                              ?.color || "var(--chart-1)",
                        }}
                      />
                      <span className="text-xs md:text-sm whitespace-nowrap">
                        {chartConfig[entry.name as keyof typeof chartConfig]
                          ?.label || entry.name}
                        : {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] sm:h-[220px] md:h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipo de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Tipo de Pago</CardTitle>
            <CardDescription className="text-xs md:text-sm">Distribución por método de pago</CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            {purchasesByPaymentType.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full flex justify-center">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[200px] sm:h-[220px] md:h-[240px] w-full max-w-[280px] sm:max-w-full"
                  >
                    <PieChart>
                      <Pie
                        data={purchasesByPaymentType}
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        dataKey="value"
                        nameKey="name"
                      >
                        {purchasesByPaymentType.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={
                              chartConfig[entry.name as keyof typeof chartConfig]
                                ?.color || "var(--chart-2)"
                            }
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="flex justify-center gap-2 md:gap-4 flex-wrap px-2">
                  {purchasesByPaymentType.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1 md:gap-2">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            chartConfig[entry.name as keyof typeof chartConfig]
                              ?.color || "var(--chart-2)",
                        }}
                      />
                      <span className="text-xs md:text-sm whitespace-nowrap">
                        {chartConfig[entry.name as keyof typeof chartConfig]
                          ?.label || entry.name}
                        : {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] sm:h-[220px] md:h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Resumen Financiero</CardTitle>
            <CardDescription className="text-xs md:text-sm">Estado de pagos y saldos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 md:p-3 bg-green-50 dark:bg-green-950 rounded-lg gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">Pagado</span>
                </div>
                <span className="text-sm md:text-lg font-bold text-primary whitespace-nowrap">
                  S/.{" "}
                  {(stats.totalPurchaseAmount - stats.pendingAmount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 md:p-3 bg-orange-50 dark:bg-orange-950 rounded-lg gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-orange-600 flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">Pendiente</span>
                </div>
                <span className="text-sm md:text-lg font-bold text-orange-600 whitespace-nowrap">
                  S/. {stats.pendingAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 md:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">Progreso de Pago</span>
                </div>
                <span className="text-sm md:text-lg font-bold text-blue-600 whitespace-nowrap">
                  {stats.totalPurchaseAmount > 0
                    ? (
                        ((stats.totalPurchaseAmount - stats.pendingAmount) /
                          stats.totalPurchaseAmount) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2 gap-2">
                <span className="text-xs md:text-sm text-muted-foreground">
                  Total Compras
                </span>
                <Badge variant="outline" className="text-xs">{stats.totalPurchases}</Badge>
              </div>
              <div className="flex justify-between items-center mb-2 gap-2">
                <span className="text-xs md:text-sm text-muted-foreground">
                  Compras Pagadas
                </span>
                <Badge variant="default" className="text-xs">{stats.paidPurchases}</Badge>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground">
                  Compras Pendientes
                </span>
                <Badge variant="secondary" className="text-xs">{stats.pendingPurchases}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
