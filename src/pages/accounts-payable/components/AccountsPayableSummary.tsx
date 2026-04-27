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
      <div className="py-1 text-xs text-muted-foreground">
        No hay cuotas pendientes registradas
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(summaryByCurrency).map(([currency, summary]) => (
        <div key={currency} className="flex items-center gap-1.5 text-xs flex-wrap border border-border/60 rounded-lg px-2 py-1.5">
          <span className="font-bold text-sm px-2 py-1 rounded-md bg-muted/50">{currency}</span>

          <span className="flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1">
            <span className="text-muted-foreground">Pendiente:</span>
            <span className="font-semibold">{formatCurrency(summary.totalPending, currency)}</span>
            <span className="text-muted-foreground">· {summary.totalInstallments} cuotas</span>
          </span>

          <span className="flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-1">
            <span className="text-muted-foreground">Vencidas:</span>
            <span className="font-semibold text-destructive">{formatCurrency(summary.totalOverdue, currency)}</span>
          </span>

          <span className="flex items-center gap-1 rounded-md bg-orange-50 dark:bg-orange-950/40 px-2 py-1">
            <span className="text-muted-foreground">Por Vencer:</span>
            <span className="font-semibold text-orange-600 dark:text-orange-500">{formatCurrency(summary.totalToExpireSoon, currency)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
