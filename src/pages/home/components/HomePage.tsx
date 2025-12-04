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
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { cn } from "@/lib/utils";
import { SalesVsPurchasesChart } from "./SalesVsPurchasesChart";
import FormSkeleton from "@/components/FormSkeleton";

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
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
}: StatCardProps) {
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
          <p
            className={cn(
              "text-2xl md:text-3xl font-bold",
              textStyles[variant]
            )}
          >
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

  const [allTransactionsByDate, setAllTransactionsByDate] = useState<
    MonthData[]
  >([]);
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
      const dateGroups: Record<string, { purchases: number; sales: number }> =
        {};

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
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setAllTransactionsByDate(dateData);

      // Top 5 productos más vendidos
      const productSales: Record<
        string,
        { quantity: number; revenue: number; name: string }
      > = {};

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
              productSales[productId].revenue +=
                parseFloat(detail.quantity) * parseFloat(detail.unit_price);
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

  const pieColors = ["var(--primary)", "var(--secondary)"];
  if (purchasesLoading || salesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FormSkeleton />
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
      <SalesVsPurchasesChart data={allTransactionsByDate} />

      {/* KPI Cards - Sin bordes */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ventas"
          value={`S/. ${stats.totalSaleAmount.toFixed(2)}`}
          subtitle={`${stats.totalSales} transacciones`}
          icon={ShoppingBag}
          
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
                    color: "var(--primary)",
                  },
                }}
                className="h-[280px] w-full"
              >
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
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
                          `${value} unidades - S/. ${props.payload.revenue.toFixed(
                            2
                          )}`,
                          "Cantidad",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="quantity"
                    fill="var(--primary)"
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
        <div className="rounded-xl bg-primary/5 p-5">
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
        <div className="rounded-xl bg-destructive/5 p-5">
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
        <div className="rounded-xl bg-muted-foreground/5 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-muted-foreground/10">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Margen Bruto
              </p>
              <p className="text-xl font-bold text-muted-foreground">
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
