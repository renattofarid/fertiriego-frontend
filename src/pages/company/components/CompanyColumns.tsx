import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { CompanyResource } from "../lib/company.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const CompanyColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<CompanyResource>[] => [
  {
    accessorKey: "social_reason",
    header: "Razón Social",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "ruc",
    header: "RUC",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "trade_name",
    header: "Nombre Comercial",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge
          variant={status === "active" ? "default" : "destructive"}
          className={`font-semibold`}
        >
          {status === "active" ? "Activo" : "Inactivo"}
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