import { formatNumber } from "@/lib/formatCurrency";
import type { WarehouseResource } from "../lib/warehouse.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const WarehouseColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<WarehouseResource>[] => [
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
    accessorKey: "capacity",
    header: "Capacidad",
    cell: ({ getValue }) => {
      const capacity = getValue() as number;
      return <span className="font-mono">{formatNumber(capacity, 0)}</span>;
    },
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
