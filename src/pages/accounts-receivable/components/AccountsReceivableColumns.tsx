import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet, Eye } from "lucide-react";
import type { SaleInstallmentResource } from "@/pages/sale/lib/sale.interface";
import { parse } from "date-fns";
import formatCurrency from "@/lib/formatCurrency";
import { matchCurrency } from "@/lib/core.function";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getStatusBadge = (installment: SaleInstallmentResource) => {
  const pendingAmount = Number(installment.pending_amount);

  if (installment.status === "ANULADA") {
    return (
      <Badge variant="outline" className="opacity-50 text-muted-foreground line-through decoration-muted-foreground">
        ANULADA
      </Badge>
    );
  }

  if (pendingAmount === 0 || installment.status === "PAGADO" || installment.status === "PAGADA") {
    return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
      PAGADO
    </Badge>;
  }

  if (installment.is_overdue) {
    return <Badge variant="destructive">VENCIDO</Badge>;
  }

  return <Badge variant="secondary">{installment.status || "PENDIENTE"}</Badge>;
};

export const getAccountsReceivableColumns = (
  onOpenPayment: (installment: SaleInstallmentResource) => void,
  onOpenQuickView: (installment: SaleInstallmentResource) => void
): ColumnDef<SaleInstallmentResource>[] => [
  {
    accessorKey: "sale_correlativo",
    header: "Venta",
    cell: ({ row }) => {
      const isVoided = row.original.status === "ANULADA";
      return (
        <Badge variant={"outline"} className={`font-mono font-semibold ${isVoided ? "opacity-50 line-through" : ""}`}>
          {row.original.full_document_number}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Emisión",
    cell: ({ row }) => {
      const isVoided = row.original.status === "ANULADA";
      return (
        <div className={`flex items-center gap-1.5 ${isVoided ? "opacity-50 line-through grayscale" : ""}`}>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">
            {formatDate(row.original.created_at)}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "due_date",
    header: "Fecha Vencimiento",
    cell: ({ row }) => {
      const isVoided = row.original.status === "ANULADA";
      return (
        <div className={`flex items-center gap-1.5 ${isVoided ? "opacity-50 line-through grayscale" : ""}`}>
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm">{formatDate(row.original.due_date)}</span>
            <span className="text-xs text-muted-foreground">
              {(() => {
                if (isVoided) return "Anulada";
                if (row.original.status === "PAGADA" || row.original.status === "PAGADO") return "Pagado";

                const daysUntilDue = Math.ceil(
                  (parse(
                    row.original.due_date,
                    "yyyy-MM-dd",
                    new Date()
                  ).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (daysUntilDue > 0) {
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
      );
    },
  },
  {
    id: "montos",
    header: "Monto y Retención",
    cell: ({ row }) => {
      const isVoided = row.original.status === "ANULADA";
      const neto = Number(row.original.total_amount);
      const bruto = Number(row.original.total_bruto || row.original.amount); 

      return (
        <div className={`text-right flex flex-col ${isVoided ? "opacity-50 line-through grayscale" : ""}`}>
          <span className="font-semibold text-primary">
            Neto (s/ ret): {formatCurrency(neto, {
              currencySymbol: matchCurrency(row.original.currency),
            })}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Total Fra: {formatCurrency(bruto, {
              currencySymbol: matchCurrency(row.original.currency),
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "pending_amount",
    header: "Pendiente",
    cell: ({ row }) => {
      const isVoided = row.original.status === "ANULADA";
      const isPending = Number(row.original.pending_amount) > 0;
      
      return (
        <div
          className={`text-right font-semibold ${
            isVoided
              ? "text-muted-foreground opacity-50 line-through"
              : isPending
              ? "text-destructive"
              : "text-primary"
          }`}
        >
          {formatCurrency(Number(row.original.pending_amount), {
            currencySymbol: matchCurrency(row.original.currency),
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
      const isVoided = row.original.status === "ANULADA";
      const isPending = Number(row.original.pending_amount) > 0;

      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenQuickView(row.original)}
            title="Vista rápida de pagos"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          {}
          {isPending && !isVoided && (
            <Button
              variant="default"
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