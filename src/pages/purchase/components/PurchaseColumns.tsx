import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseResource } from "../lib/purchase.interface";

interface PurchaseColumnsProps {
  onEdit: (purchase: PurchaseResource) => void;
  onDelete: (id: number) => void;
}

export const getPurchaseColumns = ({
  onEdit,
  onDelete,
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
        const totalAmount = parseFloat(row.original.total_amount);
        const isPaid = currentAmount === 0;

        return (
          <span className={`font-semibold ${isPaid ? "text-green-600" : "text-red-600"}`}>
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
        if (status === "PAGADO") variant = "default";
        if (status === "CANCELADO") variant = "destructive";

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "details",
      header: "Detalles",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.details?.length || 0} item(s)
        </Badge>
      ),
    },
    {
      accessorKey: "installments",
      header: "Cuotas",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.installments?.length || 0} cuota(s)
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
