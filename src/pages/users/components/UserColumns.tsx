import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserResource } from "../lib/User.interface";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

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
