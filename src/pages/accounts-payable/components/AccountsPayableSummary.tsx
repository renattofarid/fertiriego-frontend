import type { PurchaseInstallmentResource } from "../lib/accounts-payable.interface";

interface AccountsPayableSummaryProps {
  installments: PurchaseInstallmentResource[];
}

export default function AccountsPayableSummary({
  installments,
}: AccountsPayableSummaryProps) {
  // Calcular resumen agrupado por moneda
  const calculateSummary = () => {
    const today = new Date();
    const soonDate = new Date();
    soonDate.setDate(today.getDate() + 7); // Próximos 7 días

    // Objeto para agrupar por moneda (usaremos S/. por defecto)
    const summaryByCurrency: Record<
      string,
      {
        totalPending: number;
        totalOverdue: number;
        totalToExpireSoon: number;
        totalInstallments: number;
      }
    > = {};

    installments.forEach((inst) => {
      const pendingAmount = parseFloat(inst.pending_amount);
      const dueDate = new Date(inst.due_date);
      const currency = inst.currency || "S/.";

      // Inicializar moneda si no existe
      if (!summaryByCurrency[currency]) {
        summaryByCurrency[currency] = {
          totalPending: 0,
          totalOverdue: 0,
          totalToExpireSoon: 0,
          totalInstallments: 0,
        };
      }

      if (pendingAmount > 0) {
        summaryByCurrency[currency].totalPending += pendingAmount;
        summaryByCurrency[currency].totalInstallments++;

        if (dueDate < today && inst.status === "VENCIDO") {
          summaryByCurrency[currency].totalOverdue += pendingAmount;
        } else if (dueDate <= soonDate && dueDate >= today) {
          summaryByCurrency[currency].totalToExpireSoon += pendingAmount;
        }
      }
    });

    return summaryByCurrency;
  };

  const summaryByCurrency = calculateSummary();

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  if (Object.keys(summaryByCurrency).length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No hay cuotas pendientes registradas
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(summaryByCurrency).map(([currency, summary]) => (
        <div
          key={currency}
          className="grid grid-cols-2 md:grid-cols-5 gap-2"
        >
          {/* Moneda */}
          <div className="p-2 bg-muted/30 rounded-lg flex items-center justify-center">
            <p className="font-bold text-lg">{currency}</p>
          </div>

          {/* Total Pendiente */}
          <div className="p-2 bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">
              Pendiente
            </p>
            <p className="text-sm font-bold text-muted-foreground truncate">
              {formatCurrency(summary.totalPending, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.totalInstallments} cuota(s)
            </p>
          </div>

          {/* Vencidas */}
          <div className="p-2 bg-destructive/5 hover:bg-destructive/10 transition-colors rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">Vencidas</p>
            <p className="text-sm font-bold text-destructive truncate">
              {formatCurrency(summary.totalOverdue, currency)}
            </p>
          </div>

          {/* Por Vencer */}
          <div className="p-2 bg-orange-500/5 hover:bg-orange-500/10 transition-colors rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">
              Por Vencer
            </p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-500 truncate">
              {formatCurrency(summary.totalToExpireSoon, currency)}
            </p>
          </div>

          {/* Total Cuotas */}
          <div className="p-2 bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">Cuotas</p>
            <p className="text-sm font-bold text-primary truncate">
              {summary.totalInstallments}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
