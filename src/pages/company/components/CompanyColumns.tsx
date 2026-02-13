import type { CompanyResource } from "../lib/company.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

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
      <Badge className="font-mono">{getValue() as string}</Badge>
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
    accessorKey: "responsible_full_name",
    header: "Responsable",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Pencil}
            tooltip="Editar empresa"
            onClick={() => onEdit(id)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
