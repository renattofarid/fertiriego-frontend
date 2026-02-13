import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wallet, Eye } from "lucide-react";
import type { PurchaseInstallmentResource } from "../lib/accounts-payable.interface";
import { parse } from "date-fns";
import formatCurrency from "@/lib/formatCurrency";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getStatusBadge = (installment: PurchaseInstallmentResource) => {
  const pendingAmount = parseFloat(installment.pending_amount);

  if (pendingAmount === 0 || installment.status === "PAGADO") {
    return <Badge variant="default">PAGADO</Badge>;
  }

  if (installment.status === "VENCIDO") {
    return <Badge variant="destructive">VENCIDO</Badge>;
  }

  return <Badge variant="secondary">PENDIENTE</Badge>;
};

export const getAccountsPayableColumns = (
  onOpenPayment: (installment: PurchaseInstallmentResource) => void,
  onOpenQuickView: (installment: PurchaseInstallmentResource) => void,
): ColumnDef<PurchaseInstallmentResource>[] => [
  {
    accessorKey: "purchase_correlativo",
    header: "Compra",
    cell: ({ row }) => (
      <Badge variant={"outline"} className="font-mono font-semibold">
        {row.original.purchase_correlativo}
      </Badge>
    ),
  },
  {
    accessorKey: "correlativo",
    header: "Cuota",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.correlativo}
      </Badge>
    ),
  },
  {
    accessorKey: "installment_number",
    header: "Nº Cuota",
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
                  new Date(),
                ).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              if (row.original.status === "PAGADO") {
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
        {formatCurrency(Number(row.original.amount), {
          currencySymbol: "S/.",
        })}
      </div>
    ),
  },
  {
    accessorKey: "pending_amount",
    header: "Pendiente",
    cell: ({ row }) => {
      const pending = Number(row.original.pending_amount);
      const isPending = pending > 0;
      return (
        <div
          className={`text-right font-semibold ${
            isPending ? "text-destructive" : "text-primary"
          }`}
        >
          {formatCurrency(pending, {
            currencySymbol: "S/.",
          })}
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
        <ColumnActions>
          <ButtonAction
            icon={Eye}
            tooltip="Ver detalles de la cuota"
            onClick={() => onOpenQuickView(row.original)}
          />

          <ButtonAction
            icon={Wallet}
            tooltip="Gestionar pagos"
            onClick={() => onOpenPayment(row.original)}
            disabled={!isPending}
            variant="default"
            color="primary"
          />
        </ColumnActions>
      );
    },
  },
];
