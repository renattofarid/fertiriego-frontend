import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Trash2,
  Eye,
  Settings,
  Wallet,
  AlertTriangle,
  Pencil,
  Send,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SaleResource } from "../lib/sale.interface";
import { parse } from "date-fns";
import ExportButtons from "@/components/ExportButtons";
import { ButtonAction } from "@/components/ButtonAction";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

interface SaleColumnsProps {
  onEdit: (sale: SaleResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (sale: SaleResource) => void;
  onManage: (sale: SaleResource) => void;
  onQuickPay: (sale: SaleResource) => void;
  onDeclararSunat: (sale: SaleResource) => void;
}

export const getSaleColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  onManage,
  onQuickPay,
  onDeclararSunat,
}: SaleColumnsProps): ColumnDef<SaleResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        #{row.original.id}
      </Badge>
    ),
  },
  {
    accessorKey: "full_document_number",
    header: "Documento",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-xs text-muted-foreground">
          {row.original.document_type}
        </span>
        <span className="font-mono font-semibold">
          {row.original.full_document_number}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "customer_fullname",
    header: "Cliente",
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.original.customer_fullname}
      >
        {row.original.customer_fullname}
      </div>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ row }) => <span>{row.original.warehouse_name || "N/A"}</span>,
  },
  {
    accessorKey: "issue_date",
    header: "Fecha Emisión",
    cell: ({ row }) => {
      // const date = new Date(row.original.issue_date);
      const date = parse(row.original.issue_date, "yyyy-MM-dd", new Date());
      return (
        <span>
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "payment_type",
    header: "Tipo Pago",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.payment_type === "CONTADO" ? "default" : "secondary"
        }
      >
        {row.original.payment_type}
      </Badge>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      const currency =
        row.original.currency === "PEN"
          ? "S/."
          : row.original.currency === "USD"
            ? "$"
            : row.original.currency === "EUR"
              ? "€"
              : row.original.currency;
      return (
        <span className="font-semibold">
          {currency} {row.original.total_amount.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "current_amount",
    header: "Saldo",
    cell: ({ row }) => {
      const currency =
        row.original.currency === "PEN"
          ? "S/."
          : row.original.currency === "USD"
            ? "$"
            : "€";
      const currentAmount = row.original.current_amount;
      const isPaid = currentAmount === 0;

      return (
        <span
          className={`font-semibold ${
            isPaid ? "text-primary" : "text-orange-600"
          }`}
        >
          {currency} {currentAmount.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" = "default";

      if (status === "REGISTRADO") variant = "secondary";
      if (status === "PAGADA") variant = "default";
      if (status === "CANCELADO") variant = "destructive";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "details",
    header: "Detalles",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        onClick={() => onManage(row.original)}
        className="h-auto p-1"
      >
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          {row.original.details?.length || 0} item(s)
        </Badge>
      </Button>
    ),
  },
  {
    accessorKey: "installments",
    header: "Cuotas",
    cell: ({ row }) => {
      // Si es al contado, ya está pagado y no hay cuotas
      const isContado = row.original.payment_type === "CONTADO";

      if (isContado) {
        return (
          <Badge variant="outline" className="text-primary">
            Pagado
          </Badge>
        );
      }

      const hasPendingPayments = row.original.installments?.some(
        (inst) => inst.pending_amount > 0,
      );

      // Validar que la suma de cuotas sea igual al total de la venta
      const totalAmount = row.original.total_amount;
      const sumOfInstallments =
        row.original.installments?.reduce(
          (sum, inst) => sum + inst.amount,
          0,
        ) || 0;
      const isValid = Math.abs(totalAmount - sumOfInstallments) < 0.01;

      return (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onManage(row.original)}
              className="h-auto p-1"
            >
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
              >
                {row.original.installments?.length || 0} cuota(s)
              </Badge>
            </Button>

            {!isValid && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    La suma de cuotas ({sumOfInstallments.toFixed(2)}) no
                    coincide con el total ({totalAmount.toFixed(2)}).
                    <br />
                    Por favor, sincronice las cuotas.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {hasPendingPayments && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => onQuickPay(row.original)}
                    className="h-8 w-8 p-0"
                    disabled={!isValid}
                  >
                    <Wallet
                      className={`h-4 w-4 ${
                        isValid ? "text-primary" : "text-gray-400"
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isValid
                      ? "Pago rápido"
                      : "No se puede realizar pago rápido. Debe sincronizar las cuotas primero."}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const isPaid = row.original.status === "PAGADA";

      // Verificar si alguna cuota tiene pagos registrados
      // (si pending_amount es menor que amount, significa que tiene pagos)
      const hasPayments =
        row.original.installments?.some(
          (inst) => inst.pending_amount < inst.amount,
        ) ?? false;

      return (
        <div className="flex items-center gap-1">
          <ExportButtons
            pdfEndpoint={`/sale/${row.original.id}/pdf`}
            pdfFileName={`venta-${row.original.full_document_number}.pdf`}
            variant="separate"
          />
          <ButtonAction
            icon={Eye}
            onClick={() => onViewDetails(row.original)}
            tooltip="Ver Detalle"
          />

          <ButtonAction
            icon={Settings}
            onClick={() => onManage(row.original)}
            tooltip="Gestionar"
          />

          <ButtonAction
            icon={Pencil}
            onClick={() => onEdit(row.original)}
            tooltip={
              hasPayments ? "No se puede editar (tiene pagos)" : "Editar"
            }
            disabled={hasPayments}
          />

          {row.original.status === "REGISTRADA" && (
            <ConfirmationDialog
              trigger={
                <ButtonAction
                  icon={Send}
                  color="blue"
                  tooltip="Declarar a SUNAT"
                />
              }
              title="Declarar a SUNAT"
              description="¿Estás seguro de que deseas declarar esta venta a SUNAT? Esta acción no se puede deshacer."
              confirmText="Declarar"
              cancelText="Cancelar"
              onConfirm={() => onDeclararSunat(row.original)}
              icon="info"
            />
          )}

          <DeleteButton
            icon={Trash2}
            onClick={() => onDelete(row.original.id)}
            tooltip={
              isPaid || hasPayments
                ? "No se puede eliminar (pagada o tiene pagos)"
                : "Eliminar"
            }
            disabled={isPaid || hasPayments}
          />
        </div>
      );
    },
  },
];
