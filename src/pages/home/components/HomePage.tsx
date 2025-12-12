import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { usePurchase } from "@/pages/purchase/lib/purchase.hook";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { cn } from "@/lib/utils";
import { SalesVsPurchasesChart } from "./SalesVsPurchasesChart";
import { TopProductsChart } from "./TopProductsChart";
import { PaymentMethodsChart } from "./PaymentMethodsChart";
import { FinancialSummaryCard } from "./FinancialSummaryCard";
import FormSkeleton from "@/components/FormSkeleton";
import formatCurrency from "@/lib/formatCurrency";

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
  variant: "primary" | "destructive" | "secondary" | "accent" | "muted";
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
    muted: "bg-muted/10",
  };

  const textStyles = {
    primary: "text-primary",
    destructive: "text-destructive",
    secondary: "text-secondary-foreground",
    accent: "text-accent-foreground",
    muted: "text-muted-foreground",
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
          name: type,
          value: count,
        })
      );

      setSalesByPaymentType(salePaymentData);
    }
  }, [purchases, sales, products]);

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
          variant="primary"
          title="Total Ventas"
          value={`S/ ${formatCurrency(stats.totalSaleAmount)}`}
          subtitle={`${stats.totalSales} transacciones`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Total Compras"
          value={`S/ ${formatCurrency(stats.totalPurchaseAmount)}`}
          subtitle={`${stats.totalPurchases} transacciones`}
          icon={ShoppingCart}
          variant="destructive"
        />
        <StatCard
          title="Balance General"
          value={`S/ ${formatCurrency(stats.balance)}`}
          subtitle={stats.balance >= 0 ? "Positivo" : "Negativo"}
          icon={DollarSign}
          variant={stats.balance >= 0 ? "primary" : "destructive"}
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          subtitle="En el catálogo"
          icon={Package}
          variant="muted"
        />
      </div>

      {/* Charts Secundarios */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <TopProductsChart data={topProducts} />
        <PaymentMethodsChart data={salesByPaymentType} />
      </div>

      {/* Resumen Financiero Compacto */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <FinancialSummaryCard
          title="Cuentas por Cobrar"
          value={`S/. ${stats.salePendingAmount.toFixed(2)}`}
          description="Ventas a crédito pendientes de pago"
          icon={TrendingUp}
          variant="primary"
        />
        <FinancialSummaryCard
          title="Cuentas por Pagar"
          value={`S/. ${stats.purchasePendingAmount.toFixed(2)}`}
          description="Compras a crédito pendientes de pago"
          icon={TrendingUp}
          variant="destructive"
        />
        <FinancialSummaryCard
          title="Margen Bruto"
          value={`${
            stats.totalSaleAmount > 0
              ? ((stats.balance / stats.totalSaleAmount) * 100).toFixed(1)
              : 0
          }%`}
          description="Porcentaje de ganancia sobre ventas"
          icon={DollarSign}
          variant="muted"
        />
      </div>
    </div>
  );
}
