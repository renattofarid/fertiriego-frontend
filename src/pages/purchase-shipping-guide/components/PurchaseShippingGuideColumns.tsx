import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, Link as LinkIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseShippingGuideResource } from "../lib/purchase-shipping-guide.interface";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

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
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.carrier_name}</div>
    ),
  },
  {
    accessorKey: "vehicle_plate",
    header: "Placa",
    cell: ({ row }) => (
      <div className="font-mono">{row.original.vehicle_plate}</div>
    ),
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
      <Badge variant="outline">
        {row.original.details?.length || 0} producto(s)
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ButtonAction
          icon={Eye}
          tooltip="Ver Detalles"
          onClick={() => onViewDetails(row.original)}
        />
        <ButtonAction
          icon={LinkIcon}
          tooltip="Asignar Compra"
          onClick={() => onAssignPurchase(row.original)}
          disabled={!!row.original.purchase_id} // Deshabilitar si ya tiene una compra asignada
        />
        <ButtonAction
          icon={Pencil}
          tooltip="Editar"
          onClick={() => onEdit(row.original)}
        />

        <DeleteButton onClick={() => onDelete(row.original.id)} />
      </div>
    ),
  },
];
