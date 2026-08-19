import type { TagResource, TagType } from "../lib/product-tag.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { Pencil } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

const TAG_TYPE_LABELS: Record<TagType, string> = {
  rotation: "Rotación",
  priority: "Prioridad",
  supplier: "Proveedor",
  custom: "Personalizado",
};

export const TagColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (tag: TagResource) => void;
  onDelete: (id: number) => void;
}): ColumnDef<TagResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const { name, color } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full shrink-0 border border-border"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as TagType;
      return (
        <Badge variant="outline" className="font-medium">
          {TAG_TYPE_LABELS[type] ?? type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => {
      const desc = getValue() as string;
      return desc ? (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {desc}
        </span>
      ) : (
        <span className="text-muted-foreground italic text-sm">
          Sin descripción
        </span>
      );
    },
  },
  {
    accessorKey: "products_count",
    header: "Productos",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="font-semibold">
        {getValue() as number}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ getValue }) => {
      const active = getValue() as boolean;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Activo" : "Inactivo"}
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
      return (
        <ColumnActions>
          <ButtonAction
            icon={Pencil}
            tooltip="Editar"
            onClick={() => onEdit(row.original)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </ColumnActions>
      );
    },
  },
];
