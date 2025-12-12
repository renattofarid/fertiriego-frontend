import type { ValuatedInventoryItem } from "../lib/warehouse-kardex.interface";

interface ValuatedInventorySummaryProps {
  items: ValuatedInventoryItem[];
}

export default function ValuatedInventorySummary({
  items,
}: ValuatedInventorySummaryProps) {
  // Calculate totals
  const totalValue = items.reduce((sum, item) => sum + item.total_cost_balance, 0);
  const totalStock = items.reduce((sum, item) => sum + item.quantity_balance, 0);
  const totalItems = items.length;

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  if (totalItems === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No hay productos en inventario
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {/* Total de Productos */}
      <div className="p-3 bg-muted/30 hover:bg-muted/40 transition-colors rounded-lg">
        <p className="text-xs text-muted-foreground mb-0.5">
          Total de Productos
        </p>
        <p className="text-xl font-bold">{totalItems}</p>
      </div>

      {/* Stock Total */}
      <div className="p-3 bg-blue-500/5 hover:bg-blue-500/10 transition-colors rounded-lg">
        <p className="text-xs text-muted-foreground mb-0.5">
          Stock Total
        </p>
        <p className="text-xl font-bold text-blue-600 dark:text-blue-500">
          {totalStock}
        </p>
      </div>

      {/* Valor Total del Inventario */}
      <div className="p-3 bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg">
        <p className="text-xs text-muted-foreground mb-0.5">
          Valor Total
        </p>
        <p className="text-xl font-bold text-primary truncate">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Valor Promedio por Producto */}
      <div className="p-3 bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors rounded-lg">
        <p className="text-xs text-muted-foreground mb-0.5">
          Valor Promedio
        </p>
        <p className="text-xl font-bold text-muted-foreground truncate">
          {formatCurrency(totalValue / totalItems)}
        </p>
      </div>
    </div>
  );
}
