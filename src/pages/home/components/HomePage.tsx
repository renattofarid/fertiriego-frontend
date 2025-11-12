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
  TrendingUp,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePurchase } from "@/pages/purchase/lib/purchase.hook";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { cn } from "@/lib/utils";

// Tipos
interface MonthData {
  date: string;
  compras: number;
  ventas: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  variant: "primary" | "destructive" | "secondary" | "accent";
}

// Componente StatCard sin bordes
function StatCard({ title, value, subtitle, icon: Icon, variant }: StatCardProps) {
  const variantStyles = {
    primary: "bg-primary/10",
    destructive: "bg-destructive/10",
    secondary: "bg-secondary/10",
    accent: "bg-accent/10",
  };

  const textStyles = {
    primary: "text-primary",
    destructive: "text-destructive",
    secondary: "text-secondary",
    accent: "text-accent",
  };

  return (
    <div className={cn("rounded-xl p-5 shadow-sm", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl md:text-3xl font-bold", textStyles[variant])}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Icon className={cn("h-10 w-10 opacity-60", textStyles[variant])} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: purchases, isLoading: purchasesLoading } = usePurchase();
  const { data: sales, isLoading: salesLoading } = useAllSales();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  const [timeRange, setTimeRange] = useState("90d");

  // Estados para las estadísticas
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalPurchaseAmount: 0,
    purchasePendingAmount: 0,
    totalSales: 0,
    totalSaleAmount: 0,
    salePendingAmount: 0,
    totalProducts: 0,
    balance: 0,
  });

  const [allTransactionsByDate, setAllTransactionsByDate] = useState<MonthData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<MonthData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesByPaymentType, setSalesByPaymentType] = useState<any[]>([]);

  // Calcular datos cuando cambian purchases, sales o products
  useEffect(() => {
    if (purchases && sales && products) {
      // Calcular estadísticas de compras
      const totalPurchaseAmount = purchases.reduce(
        (sum, p) => sum + parseFloat(p.total_amount),
        0
      );
      const purchasePendingAmount = purchases.reduce(
        (sum, p) => sum + parseFloat(p.current_amount),
        0
      );

      // Calcular estadísticas de ventas
      const totalSaleAmount = sales.reduce(
        (sum, s) => sum + parseFloat(s.total_amount.toString()),
        0
      );
      const salePendingAmount = sales.reduce(
        (sum, s) => sum + parseFloat(s.current_amount.toString()),
        0
      );

      const balance = totalSaleAmount - totalPurchaseAmount;

      setStats({
        totalPurchases: purchases.length,
        totalPurchaseAmount,
        purchasePendingAmount,
        totalSales: sales.length,
        totalSaleAmount,
        salePendingAmount,
        totalProducts: products?.length || 0,
        balance,
      });

      // Agrupar transacciones por fecha (diarias para el chart)
      const dateGroups: Record<string, { purchases: number; sales: number }> = {};

      purchases.forEach((purchase) => {
        const date = purchase.issue_date;
        if (!dateGroups[date]) {
          dateGroups[date] = { purchases: 0, sales: 0 };
        }
        dateGroups[date].purchases += parseFloat(purchase.total_amount);
      });

      sales.forEach((sale) => {
        const date = sale.issue_date;
        if (!dateGroups[date]) {
          dateGroups[date] = { purchases: 0, sales: 0 };
        }
        dateGroups[date].sales += parseFloat(sale.total_amount.toString());
      });

      const dateData = Object.entries(dateGroups)
        .map(([date, data]) => ({
          date,
          compras: Number(data.purchases.toFixed(2)),
          ventas: Number(data.sales.toFixed(2)),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setAllTransactionsByDate(dateData);

      // Top 5 productos más vendidos
      const productSales: Record<string, { quantity: number; revenue: number; name: string }> = {};

      sales.forEach((sale) => {
        if (sale.details && Array.isArray(sale.details)) {
          sale.details.forEach((detail: any) => {
            const productId = detail.product_id.toString();
            const product = products.find((p) => p.id.toString() === productId);

            if (product) {
              if (!productSales[productId]) {
                productSales[productId] = {
                  name: product.name,
                  quantity: 0,
                  revenue: 0,
                };
              }
              productSales[productId].quantity += parseFloat(detail.quantity);
              productSales[productId].revenue += parseFloat(detail.quantity) * parseFloat(detail.unit_price);
            }
          });
        }
      });

      const topProductsData = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopProducts(topProductsData);

      // Agrupar por tipo de pago - Ventas
      const salePaymentGroups: Record<string, number> = {};
      sales.forEach((sale) => {
        salePaymentGroups[sale.payment_type] =
          (salePaymentGroups[sale.payment_type] || 0) + 1;
      });

      const salePaymentData = Object.entries(salePaymentGroups).map(
        ([type, count]) => ({
          name: type === "CONTADO" ? "Contado" : "Crédito",
          value: count,
        })
      );

      setSalesByPaymentType(salePaymentData);
    }
  }, [purchases, sales, products]);

  // Filtrar datos según el rango de tiempo seleccionado
  useEffect(() => {
    if (allTransactionsByDate.length > 0) {
      const now = new Date();
      let daysToSubtract = 90;

      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }

      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysToSubtract);

      const filtered = allTransactionsByDate.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate;
      });

      setFilteredTransactions(filtered);
    }
  }, [allTransactionsByDate, timeRange]);

  const chartConfig = {
    compras: {
      label: "Compras",
      color: "hsl(var(--destructive))",
    },
    ventas: {
      label: "Ventas",
      color: "hsl(var(--primary))",
    },
  };

  const pieColors = ["hsl(var(--primary))", "hsl(var(--secondary))"];

  if (purchasesLoading || salesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Vista general de tu sistema de gestión
        </p>
      </div>

      {/* Gráfico Principal - AreaChart Interactivo */}
      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 space-y-0 border-b pb-4">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-base md:text-lg">
              Compras vs Ventas
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Comparación de montos en el período seleccionado
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Seleccionar período"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 md:px-6 pt-4">
          {filteredTransactions.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[280px] sm:h-[320px] w-full"
            >
              <AreaChart
                data={filteredTransactions}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillCompras" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--destructive))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--destructive))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} width={50} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("es-ES", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="ventas"
                  type="monotone"
                  fill="url(#fillVentas)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="compras"
                  type="monotone"
                  fill="url(#fillCompras)"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[280px] sm:h-[320px] flex items-center justify-center text-muted-foreground text-sm">
              No hay datos disponibles para el período seleccionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards - Sin bordes */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ventas"
          value={`S/. ${stats.totalSaleAmount.toFixed(2)}`}
          subtitle={`${stats.totalSales} transacciones`}
          icon={ShoppingBag}
          variant="primary"
        />
        <StatCard
          title="Total Compras"
          value={`S/. ${stats.totalPurchaseAmount.toFixed(2)}`}
          subtitle={`${stats.totalPurchases} transacciones`}
          icon={ShoppingCart}
          variant="destructive"
        />
        <StatCard
          title="Balance General"
          value={`S/. ${stats.balance.toFixed(2)}`}
          subtitle={stats.balance >= 0 ? "Positivo" : "Negativo"}
          icon={DollarSign}
          variant={stats.balance >= 0 ? "primary" : "destructive"}
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          subtitle="En el catálogo"
          icon={Package}
          variant="secondary"
        />
      </div>

      {/* Charts Secundarios */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Top 5 Productos */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">
              Top 5 Productos Más Vendidos
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Por cantidad vendida
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            {topProducts.length > 0 ? (
              <ChartContainer
                config={{
                  quantity: {
                    label: "Cantidad",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[280px] w-full"
              >
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={100}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, _name, props) => [
                          `${value} unidades - S/. ${props.payload.revenue.toFixed(2)}`,
                          "Cantidad",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="quantity"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No hay datos de productos vendidos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Métodos de Pago */}
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
            {salesByPaymentType.length > 0 ? (
              <ChartContainer
                config={{
                  contado: {
                    label: "Contado",
                    color: "hsl(var(--primary))",
                  },
                  credito: {
                    label: "Crédito",
                    color: "hsl(var(--secondary))",
                  },
                }}
                className="h-[280px] w-full"
              >
                <PieChart>
                  <Pie
                    data={salesByPaymentType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {salesByPaymentType.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
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
      </div>

      {/* Resumen Financiero Compacto */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Cuentas por Cobrar */}
        <div className="rounded-xl bg-primary/5 p-5 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Cuentas por Cobrar
              </p>
              <p className="text-xl font-bold text-primary">
                S/. {stats.salePendingAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Ventas a crédito pendientes de pago
          </p>
        </div>

        {/* Cuentas por Pagar */}
        <div className="rounded-xl bg-destructive/5 p-5 border border-destructive/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingUp className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Cuentas por Pagar
              </p>
              <p className="text-xl font-bold text-destructive">
                S/. {stats.purchasePendingAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Compras a crédito pendientes de pago
          </p>
        </div>

        {/* Margen Neto */}
        <div className="rounded-xl bg-accent/5 p-5 border border-accent/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Margen Bruto
              </p>
              <p className="text-xl font-bold text-accent">
                {stats.totalSaleAmount > 0
                  ? ((stats.balance / stats.totalSaleAmount) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Porcentaje de ganancia sobre ventas
          </p>
        </div>
      </div>
    </div>
  );
}
