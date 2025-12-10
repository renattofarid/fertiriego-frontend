import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Eye, Pencil, FileText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { OrderResource } from "../lib/order.interface";
import ExportButtons from "@/components/ExportButtons";

interface OrderColumnsProps {
  onEdit: (order: OrderResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (order: OrderResource) => void;
  onGenerateSale: (order: OrderResource) => void;
}

export const getOrderColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  onGenerateSale,
}: OrderColumnsProps): ColumnDef<OrderResource>[] => [
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
    accessorKey: "order_number",
    header: "N° Pedido",
    cell: ({ row }) => (
      <span className="font-mono font-semibold">
        {row.original.order_number}
      </span>
    ),
  },
  {
    accessorKey: "customer_fullname",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        {row.original.customer?.business_name ||
          row.original.customer?.full_name}
      </div>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ row }) => <span>{row.original.warehouse?.name || "N/A"}</span>,
  },
  {
    accessorKey: "order_date",
    header: "Fecha Pedido",
    cell: ({ row }) => {
      const date = new Date(row.original.order_date);
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
    accessorKey: "order_delivery_date",
    header: "Fecha Entrega",
    cell: ({ row }) => {
      const date = new Date(row.original.order_delivery_date);
      return (
        <Badge variant="secondary">
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
    accessorKey: "order_expiry_date",
    header: "Fecha Vencimiento",
    cell: ({ row }) => {
      const date = new Date(row.original.order_expiry_date);
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
          case "En Proceso":
            return "secondary";
          case "Completado":
            return "green";
          case "Entregado":
            return "green";
          case "Cancelado":
            return "destructive";
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
    accessorKey: "quotation_number",
    header: "Cotización",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.quotation?.quotation_number || "N/A"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <ExportButtons
          pdfEndpoint={`/order/pdf/${row.original.id}`}
          pdfFileName={`pedido-${row.original.order_number}.pdf`}
          variant="separate"
        />
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
              onClick={() => onGenerateSale(row.original)}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generar Venta
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
      </div>
    ),
  },
];
