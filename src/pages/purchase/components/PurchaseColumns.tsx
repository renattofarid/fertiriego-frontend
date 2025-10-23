import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, MoreVertical, Trash2, Eye, Settings, Wallet, AlertTriangle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseResource } from "../lib/purchase.interface";

interface PurchaseColumnsProps {
  onEdit: (purchase: PurchaseResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (purchase: PurchaseResource) => void;
  onManage: (purchase: PurchaseResource) => void;
  onQuickPay: (purchase: PurchaseResource) => void;
}

export const getPurchaseColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  onManage,
  onQuickPay,
}: PurchaseColumnsProps): ColumnDef<PurchaseResource>[] => [
    {
      accessorKey: "correlativo",
      header: "Correlativo",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.correlativo}
        </Badge>
      ),
    },
    {
      accessorKey: "document_type",
      header: "Tipo Doc.",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.document_type}</span>
      ),
    },
    {
      accessorKey: "document_number",
      header: "Número Doc.",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.document_number}</span>
      ),
    },
    {
      accessorKey: "supplier_fullname",
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.supplier_fullname}>
          {row.original.supplier_fullname}
        </div>
      ),
    },
    {
      accessorKey: "warehouse_name",
      header: "Almacén",
      cell: ({ row }) => (
        <span>{row.original.warehouse_name || "N/A"}</span>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Fecha Emisión",
      cell: ({ row }) => {
        const date = new Date(row.original.issue_date);
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
        <Badge variant={row.original.payment_type === "CONTADO" ? "default" : "secondary"}>
          {row.original.payment_type}
        </Badge>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => {
        const currency = row.original.currency === "PEN" ? "S/." : "$";
        return (
          <span className="font-semibold">
            {currency} {parseFloat(row.original.total_amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "current_amount",
      header: "Saldo",
      cell: ({ row }) => {
        const currency = row.original.currency === "PEN" ? "S/." : "$";
        const currentAmount = parseFloat(row.original.current_amount);
        const isPaid = currentAmount === 0;

        return (
          <span className={`font-semibold ${isPaid ? "text-green-600" : "text-orange-600"}`}>
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
          size="sm"
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
        const hasPendingPayments = row.original.installments?.some(
          (inst) => parseFloat(inst.pending_amount) > 0
        );

        // Validar que la suma de cuotas sea igual al total de la compra
        const totalAmount = parseFloat(row.original.total_amount);
        const sumOfInstallments = row.original.installments?.reduce(
          (sum, inst) => sum + parseFloat(inst.amount),
          0
        ) || 0;
        const isValid = Math.abs(totalAmount - sumOfInstallments) < 0.01;

        return (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onManage(row.original)}
                className="h-auto p-1"
              >
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
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
                      La suma de cuotas ({sumOfInstallments.toFixed(2)}) no coincide con el total ({totalAmount.toFixed(2)}).
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
                      size="sm"
                      onClick={() => onQuickPay(row.original)}
                      className="h-8 w-8 p-0"
                      disabled={!isValid}
                    >
                      <Wallet className={`h-4 w-4 ${isValid ? "text-green-600" : "text-gray-400"}`} />
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

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManage(row.original)}>
                <Settings className="mr-2 h-4 w-4" />
                Gestionar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => !isPaid && onEdit(row.original)}
                disabled={isPaid}
                className={isPaid ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar {isPaid && "(Pagado)"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => !isPaid && onDelete(row.original.id)}
                disabled={isPaid}
                className={isPaid ? "opacity-50 cursor-not-allowed" : "text-red-600"}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar {isPaid && "(Pagado)"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
