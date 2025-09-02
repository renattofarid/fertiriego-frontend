"use client";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserResource } from "../lib/User.interface";

export type UserColumns = ColumnDef<UserResource>;

export const UserColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<UserResource>[] => [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ getValue }) => {
      return <div className="text-sm">{getValue() as string}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "person.number_document",
    header: "Número de Documento",
  },
  {
    accessorKey: "rol_name",
    header: "Rol",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={"outline"} className={`font-semibold`}>
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
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
