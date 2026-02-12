import type { WarehouseDocumentResource } from "../lib/warehouse-document.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  getDocumentTypeLabel,
  getDocumentStatusVariant,
} from "../lib/warehouse-document.constants";
import { CheckCircle, Eye, Pencil, XCircle } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const WarehouseDocumentColumns = ({
  onEdit,
  onDelete,
  onView,
  onConfirm,
  onCancel,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
}): ColumnDef<WarehouseDocumentResource>[] => [
  {
    accessorKey: "document_number",
    header: "Número de Documento",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-medium">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.original.document_type;
      const isEntry = type.startsWith("ENTRADA_");
      return (
        <Badge
          variant={isEntry ? "default" : "secondary"}
          className="font-medium"
        >
          {getDocumentTypeLabel(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "person_fullname",
    header: "Responsable",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "document_date",
    header: "Fecha del Documento",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = getDocumentStatusVariant(status);
      return (
        <Badge variant={variant} className="font-semibold">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;
      const status = row.original.status;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Eye}
            tooltip="Ver Detalles"
            onClick={() => onView(id)}
          />

          <ButtonAction
            icon={Pencil}
            tooltip="Editar Documento"
            onClick={() => onEdit(id)}
            canRender={status === "BORRADOR"}
          />

          <ButtonAction
            icon={CheckCircle}
            tooltip="Confirmar Documento"
            color="green"
            onClick={() => onConfirm(id)}
            canRender={status === "BORRADOR"}
          />

          <ButtonAction
            icon={XCircle}
            tooltip="Cancelar"
            onClick={() => onCancel(id)}
            color="orange"
            canRender={status === "CONFIRMADO"}
          />

          {status === "BORRADOR" && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
