import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet } from "lucide-react";
import type { SaleInstallmentResource } from "@/pages/sale/lib/sale.interface";

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
    return (
      <Badge variant="default" className="bg-green-600">
        PAGADO
      </Badge>
    );
  }

  if (installment.status === "VENCIDO") {
    return <Badge variant="destructive">VENCIDO</Badge>;
  }

  return <Badge variant="secondary">PENDIENTE</Badge>;
};

export const getAccountsReceivableColumns = (
  onOpenPayment: (installment: SaleInstallmentResource) => void
): ColumnDef<SaleInstallmentResource>[] => [
  {
    accessorKey: "sale_correlativo",
    header: "Venta",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.original.sale_correlativo}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.correlativo}
        </span>
      </div>
    ),
  },
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
            {row.original.due_days} días
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
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenPayment(row.original)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isPending ? "Pagar" : "Ver Pagos"}
          </Button>
        </div>
      );
    },
  },
];
