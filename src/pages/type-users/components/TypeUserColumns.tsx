import type { TypeUserResource } from "../lib/typeUser.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { Lock, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const TypeUserColumns = ({
  onEdit,
  onPermissions,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onPermissions: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<TypeUserResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge
          variant={status === "Activo" ? "default" : "destructive"}
          className={`font-semibold`}
        >
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
          <ButtonAction
            icon={Lock}
            tooltip="Permisos"
            onClick={() => onPermissions(id)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </ColumnActions>
      );
    },
  },
];
