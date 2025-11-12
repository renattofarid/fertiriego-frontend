import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet, Eye } from "lucide-react";
import type { SaleInstallmentResource } from "@/pages/sale/lib/sale.interface";
import { parse } from "date-fns";

export const formatCurrency = (amount: number) => {
  return `S/. ${amount.toFixed(2)}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getStatusBadge = (installment: SaleInstallmentResource) => {
  const pendingAmount = parseFloat(installment.pending_amount);

  if (pendingAmount === 0 || installment.status === "PAGADO") {
    return <Badge variant="default">PAGADO</Badge>;
  }

  if (installment.status === "VENCIDO") {
    return <Badge variant="destructive">VENCIDO</Badge>;
  }

  return <Badge variant="secondary">PENDIENTE</Badge>;
};

export const getAccountsReceivableColumns = (
  onOpenPayment: (installment: SaleInstallmentResource) => void,
  onOpenQuickView: (installment: SaleInstallmentResource) => void
): ColumnDef<SaleInstallmentResource>[] => [
  // {
  //   accessorKey: "sale_correlativo",
  //   header: "Venta",
  //   cell: ({ row }) => (
  //     <div className="flex flex-col">
  //       <span className="font-semibold">{row.original.sale_correlativo}</span>
  //       <span className="text-xs text-muted-foreground">
  //         {row.original.correlativo}
  //       </span>
  //     </div>
  //   ),
  // },
  {
    accessorKey: "installment_number",
    header: "Cuota",
    cell: ({ row }) => (
      <Badge variant="outline">Cuota {row.original.installment_number}</Badge>
    ),
  },
  {
    accessorKey: "due_date",
    header: "Fecha Vencimiento",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(row.original.due_date)}</span>
          <span className="text-xs text-muted-foreground">
            {(() => {
              const daysUntilDue = Math.ceil(
                (parse(
                  row.original.due_date,
                  "yyyy-MM-dd",
                  new Date()
                ).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              if (row.original.status === "PAGADA") {
                return "Pagado";
              } else if (daysUntilDue > 0) {
                return `${daysUntilDue} días para vencer`;
              } else if (daysUntilDue === 0) {
                return "Vence hoy";
              } else {
                return `${Math.abs(daysUntilDue)} días vencido`;
              }
            })()}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <div className="text-right font-semibold">
        {formatCurrency(parseFloat(row.original.amount))}
      </div>
    ),
  },
  {
    accessorKey: "pending_amount",
    header: "Pendiente",
    cell: ({ row }) => {
      const isPending = parseFloat(row.original.pending_amount) > 0;
      return (
        <div
          className={`text-right font-semibold ${
            isPending ? "text-destructive" : "text-primary"
          }`}
        >
          {formatCurrency(parseFloat(row.original.pending_amount))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => getStatusBadge(row.original),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => {
      const isPending = parseFloat(row.original.pending_amount) > 0;
      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenQuickView(row.original)}
            title="Vista rápida de pagos"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          {isPending && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenPayment(row.original)}
              title="Gestionar pagos"
            >
              <Wallet className="h-4 w-4 mr-1" />
              Gestionar
            </Button>
          )}
        </div>
      );
    },
  },
];
