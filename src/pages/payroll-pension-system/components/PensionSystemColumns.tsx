import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { ColumnActions } from "@/components/SelectActions";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import type { PensionSystemResource } from "../lib/pension-system.interface";

export const PensionSystemColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (item: PensionSystemResource) => void;
  onDelete: (id: number) => void;
}): ColumnDef<PensionSystemResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ColumnActions>
        <ButtonAction
          icon={Pencil}
          tooltip="Editar"
          onClick={() => onEdit(row.original)}
        />
        <DeleteButton onClick={() => onDelete(row.original.id)} />
      </ColumnActions>
    ),
  },
];
