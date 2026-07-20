import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import { formatCurrency } from "@/lib/formatCurrency";
import type { IncomeResource } from "../lib/income.interface";

export const IncomeColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ColumnDef<IncomeResource>[] => [
  {
    accessorKey: "person_name",
    header: "Trabajador",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.person_name ?? `#${row.original.person_id}`}
      </span>
    ),
  },
  {
    accessorKey: "concept",
    header: "Concepto",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => (
      <span className="font-medium text-green-600">
        +{formatCurrency(Number(getValue()), { currencySymbol: "S/" })}
      </span>
    ),
  },
  {
    accessorKey: "is_taxable",
    header: "Afecto",
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? "default" : "secondary"}>
        {getValue() ? "Sí" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? "default" : "secondary"}>
        {getValue() ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ColumnActions>
        <DeleteButton onClick={() => onDelete(row.original.id)} />
      </ColumnActions>
    ),
  },
];
