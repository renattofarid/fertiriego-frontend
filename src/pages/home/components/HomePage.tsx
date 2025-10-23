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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
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
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
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
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold text-orange-600">
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
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">En el catálogo</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Compras por Mes */}
        <Card>
          <CardHeader>
            <CardTitle>Compras por Mes</CardTitle>
            <CardDescription>
              Monto total de compras en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {purchasesByMonth.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={purchasesByMonth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Compras */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Compras</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            {purchasesByStatus.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer
                  config={chartConfig}
                  className="h-[240px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={purchasesByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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
                <div className="flex justify-center gap-4 flex-wrap">
                  {purchasesByStatus.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            chartConfig[entry.name as keyof typeof chartConfig]
                              ?.color || "var(--chart-1)",
                        }}
                      />
                      <span className="text-sm">
                        {chartConfig[entry.name as keyof typeof chartConfig]
                          ?.label || entry.name}
                        : {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipo de Pago */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Pago</CardTitle>
            <CardDescription>Distribución por método de pago</CardDescription>
          </CardHeader>
          <CardContent>
            {purchasesByPaymentType.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer
                  config={chartConfig}
                  className="h-[240px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={purchasesByPaymentType}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label
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
                <div className="flex justify-center gap-4 flex-wrap">
                  {purchasesByPaymentType.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            chartConfig[entry.name as keyof typeof chartConfig]
                              ?.color || "var(--chart-2)",
                        }}
                      />
                      <span className="text-sm">
                        {chartConfig[entry.name as keyof typeof chartConfig]
                          ?.label || entry.name}
                        : {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Pagos */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
            <CardDescription>Estado de pagos y saldos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Pagado</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  S/.{" "}
                  {(stats.totalPurchaseAmount - stats.pendingAmount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Pendiente</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  S/. {stats.pendingAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Progreso de Pago</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
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
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Total Compras
                </span>
                <Badge variant="outline">{stats.totalPurchases}</Badge>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Compras Pagadas
                </span>
                <Badge variant="default">{stats.paidPurchases}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Compras Pendientes
                </span>
                <Badge variant="secondary">{stats.pendingPurchases}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
