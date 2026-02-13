import type { CategoryResource } from "../lib/category.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { Pencil } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const CategoryColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<CategoryResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="flex items-center">
          <span className="font-semibold">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "parent_name",
    header: "Categoría Padre",
    cell: ({ getValue }) => {
      const parentName = getValue() as string;
      return (
        parentName || (
          <span className="text-muted-foreground italic">Sin padre</span>
        )
      );
    },
  },
  {
    accessorKey: "level",
    header: "Nivel",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="font-semibold">
        Nivel {getValue() as number}
      </Badge>
    ),
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
            onClick={() => onEdit(id)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </ColumnActions>
      );
    },
  },
];
