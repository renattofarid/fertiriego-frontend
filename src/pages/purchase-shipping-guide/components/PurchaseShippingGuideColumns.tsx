import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2, Eye, Link as LinkIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseShippingGuideResource } from "../lib/purchase-shipping-guide.interface";

interface PurchaseShippingGuideColumnsProps {
  onEdit: (guide: PurchaseShippingGuideResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (guide: PurchaseShippingGuideResource) => void;
  onAssignPurchase: (guide: PurchaseShippingGuideResource) => void;
}

export const getPurchaseShippingGuideColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  onAssignPurchase,
}: PurchaseShippingGuideColumnsProps): ColumnDef<PurchaseShippingGuideResource>[] => [
  {
    accessorKey: "guide_number",
    header: "Número de Guía",
    cell: ({ row }) => (
      <div className="font-mono font-semibold">{row.original.guide_number}</div>
    ),
  },
  {
    accessorKey: "purchase_correlative",
    header: "Compra",
    cell: ({ row }) => (
      <div>
        {row.original.purchase_correlative ? (
          <Badge variant="outline">{row.original.purchase_correlative}</Badge>
        ) : (
          <Badge variant="secondary">Sin compra</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "carrier_name",
    header: "Transportista",
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.original.carrier_name}</div>,
  },
  {
    accessorKey: "vehicle_plate",
    header: "Placa",
    cell: ({ row }) => <div className="font-mono">{row.original.vehicle_plate}</div>,
  },
  {
    accessorKey: "issue_date",
    header: "F. Emisión",
    cell: ({ row }) => {
      const date = new Date(row.original.issue_date);
      return <div>{date.toLocaleDateString("es-ES")}</div>;
    },
  },
  {
    accessorKey: "transfer_date",
    header: "F. Traslado",
    cell: ({ row }) => {
      const date = new Date(row.original.transfer_date);
      return <div>{date.toLocaleDateString("es-ES")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const statusVariant = {
        EMITIDA: "secondary" as const,
        EN_TRANSITO: "default" as const,
        ENTREGADA: "default" as const,
        CANCELADA: "destructive" as const,
      };

      return (
        <Badge variant={statusVariant[row.original.status] || "secondary"}>
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Detalles",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.details?.length || 0} producto(s)</Badge>
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
          <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>
          {!row.original.purchase_id && (
            <DropdownMenuItem onClick={() => onAssignPurchase(row.original)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Asignar Compra
            </DropdownMenuItem>
          )}
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
