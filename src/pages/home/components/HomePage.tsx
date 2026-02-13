import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { cn } from "@/lib/utils";
import { SalesVsPurchasesChart } from "./SalesVsPurchasesChart";
import { TopProductsChart } from "./TopProductsChart";
import { PaymentMethodsChart } from "./PaymentMethodsChart";
import FormSkeleton from "@/components/FormSkeleton";
import formatCurrency from "@/lib/formatCurrency";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";

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

// Componente de métrica simple y limpio - layout horizontal compacto
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
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            {title}
          </p>
          <p className={cn("text-xl font-bold mb-0.5", textStyles[variant])}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: purchases = [], isLoading: purchasesLoading } =
    useAllPurchases();
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
    averageTicketSale: 0,
    averageTicketPurchase: 0,
    cashSalesPercentage: 0,
    creditSalesPercentage: 0,
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
      const totalPurchaseAmount = purchases?.reduce(
        (sum, p) => sum + parseFloat(p.total_amount),
        0,
      );
      const purchasePendingAmount = purchases?.reduce(
        (sum, p) => sum + parseFloat(p.current_amount),
        0,
      );

      // Calcular estadísticas de ventas
      const totalSaleAmount = sales.reduce(
        (sum, s) => sum + parseFloat(s.total_amount.toString()),
        0,
      );
      const salePendingAmount = sales.reduce(
        (sum, s) => sum + parseFloat(s.current_amount.toString()),
        0,
      );

      const balance = totalSaleAmount - totalPurchaseAmount;

      // Calcular promedios
      const averageTicketSale =
        sales.length > 0 ? totalSaleAmount / sales.length : 0;
      const averageTicketPurchase =
        purchases.length > 0 ? totalPurchaseAmount / purchases.length : 0;

      // Calcular porcentajes de métodos de pago
      const cashSales = sales.filter(
        (s) => s.payment_type === "CONTADO",
      ).length;
      const creditSales = sales.filter(
        (s) => s.payment_type === "CREDITO",
      ).length;
      const cashSalesPercentage =
        sales.length > 0 ? (cashSales / sales.length) * 100 : 0;
      const creditSalesPercentage =
        sales.length > 0 ? (creditSales / sales.length) * 100 : 0;

      setStats({
        totalPurchases: purchases.length,
        totalPurchaseAmount,
        purchasePendingAmount,
        totalSales: sales.length,
        totalSaleAmount,
        salePendingAmount,
        totalProducts: products?.length || 0,
        balance,
        averageTicketSale,
        averageTicketPurchase,
        cashSalesPercentage,
        creditSalesPercentage,
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
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
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
        }),
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
      {/* Header Simple */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Sección de Métricas - Todo con el mismo estilo limpio */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Métricas Principales</h2>

        {/* Grid de métricas - 6 cards más compactas */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Ventas"
            value={`S/ ${formatCurrency(stats.totalSaleAmount)}`}
            description={`${stats.totalSales} transacciones realizadas`}
            icon={ShoppingBag}
            variant="blue"
          />

          <MetricCard
            title="Total Compras"
            value={`S/ ${formatCurrency(stats.totalPurchaseAmount)}`}
            description={`${stats.totalPurchases} compras registradas`}
            icon={ShoppingCart}
            variant="orange"
          />

          <MetricCard
            title="Balance Neto"
            value={`S/ ${formatCurrency(stats.balance)}`}
            description={`Margen: ${
              stats.totalSaleAmount > 0
                ? ((stats.balance / stats.totalSaleAmount) * 100).toFixed(1)
                : 0
            }%`}
            icon={DollarSign}
            variant={stats.balance >= 0 ? "green" : "orange"}
          />

          <MetricCard
            title="Cuentas por Cobrar"
            value={`S/ ${formatCurrency(stats.salePendingAmount)}`}
            description={`${(
              (stats.salePendingAmount / stats.totalSaleAmount) *
              100
            ).toFixed(0)}% del total de ventas`}
            icon={TrendingUp}
            variant="blue"
          />

          <MetricCard
            title="Cuentas por Pagar"
            value={`S/ ${formatCurrency(stats.purchasePendingAmount)}`}
            description={`${(
              (stats.purchasePendingAmount / stats.totalPurchaseAmount) *
              100
            ).toFixed(0)}% del total de compras`}
            icon={TrendingDown}
            variant="orange"
          />

          <MetricCard
            title="Productos en Catálogo"
            value={stats.totalProducts.toString()}
            description={`Ticket promedio: S/ ${formatCurrency(
              stats.averageTicketSale,
            )}`}
            icon={Package}
            variant="gray"
          />
        </div>
      </div>

      {/* Sección de Gráficos */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Análisis Visual</h2>

        {/* Gráfico Principal */}
        <SalesVsPurchasesChart data={allTransactionsByDate} />

        {/* Gráficos Secundarios */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <TopProductsChart data={topProducts} />
          <PaymentMethodsChart data={salesByPaymentType} />
        </div>
      </div>
    </div>
  );
}
