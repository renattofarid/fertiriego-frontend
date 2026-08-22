import type { MenuGroupResource } from "../lib/menuGroup.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import * as LucideReact from "lucide-react";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const MenuGroupColumns = ({
  allMenuGroups = [],
  onEdit,
  onDelete,
}: {
  allMenuGroups?: MenuGroupResource[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<MenuGroupResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row, getValue }) => {
      const Icon = LucideReact[
        row.original.icon as keyof typeof LucideReact
      ] as React.ComponentType<any> | undefined;
      return (
        <span className="flex items-center gap-2 font-semibold">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          {getValue() as string}
        </span>
      );
    },
  },
  {
    accessorKey: "group_menu_id",
    header: "Grupo padre",
    cell: ({ row }) => {
      const parent = allMenuGroups.find(
        (m) => m.id === row.original.group_menu_id
      );
      return parent ? (
        <span>{parent.name}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={status === "Activo" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
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
