import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Eye, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { QuotationResource } from "../lib/quotation.interface";

interface QuotationColumnsProps {
  onEdit: (quotation: QuotationResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (quotation: QuotationResource) => void;
}

export const getQuotationColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
}: QuotationColumnsProps): ColumnDef<QuotationResource>[] => [
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
    accessorKey: "quotation_number",
    header: "N° Cotización",
    cell: ({ row }) => (
      <span className="font-mono font-semibold">
        {row.original.quotation_number}
      </span>
    ),
  },
  {
    accessorKey: "customer_fullname",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        {row.original?.customer?.business_name ||
          row.original?.customer?.full_name}
      </div>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ row }) => <span>{row.original?.warehouse?.name || "N/A"}</span>,
  },
  {
    accessorKey: "fecha_emision",
    header: "Fecha Emisión",
    cell: ({ row }) => {
      const date = new Date(row.original.fecha_emision);
      return (
        <Badge variant="outline">
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Badge>
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
    accessorKey: "currency",
    header: "Moneda",
    cell: ({ row }) => <Badge variant="outline">{row.original.currency}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const getStatusVariant = (
        status: string
      ): "default" | "green" | "destructive" | "secondary" => {
        switch (status) {
          case "Pendiente":
            return "default";
          case "Aprobado":
            return "green";
          case "Rechazado":
            return "destructive";
          case "Vencido":
            return "secondary";
          default:
            return "default";
        }
      };

      return (
        <Badge variant={getStatusVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "delivery_time",
    header: "Tiempo Entrega",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.delivery_time}</span>
    ),
  },
  {
    accessorKey: "validity_time",
    header: "Vigencia",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.validity_time}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onViewDetails(row.original)}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onEdit(row.original)}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(row.original.id)}
            className="cursor-pointer text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
