import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { BranchResource } from "../lib/branch.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

export const BranchColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<BranchResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Dirección",
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
    accessorKey: "is_invoice",
    header: "Emite Factura",
    cell: ({ getValue }) => {
      const isInvoice = getValue() as number | boolean;
      const canInvoice = isInvoice === 1 || isInvoice === true;

      return (
        <div className="flex items-center gap-2">
          {canInvoice ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm">
            {canInvoice ? "Sí" : "No"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "responsible_full_name",
    header: "Responsable",
    cell: ({ getValue }) => {
      const name = getValue() as string;
      return name ? name.trim() : "Sin responsable";
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