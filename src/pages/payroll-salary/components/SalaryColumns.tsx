import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatCurrency";
import type { SalaryResource } from "../lib/salary.interface";

export const SalaryColumns = (): ColumnDef<SalaryResource>[] => [
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
    accessorKey: "base_salary",
    header: "Salario Base",
    cell: ({ getValue }) => (
      <span className="font-medium">
        {formatCurrency(Number(getValue()), { currencySymbol: "S/" })}
      </span>
    ),
  },
  {
    accessorKey: "valid_from",
    header: "Vigente Desde",
  },
  {
    accessorKey: "valid_until",
    header: "Vigente Hasta",
    cell: ({ getValue }) => (getValue() as string) || "Indefinido",
  },
  {
    id: "pension_system",
    header: "Sistema de Pensión",
    cell: ({ row }) =>
      row.original.pension_system ? (
        <Badge variant="outline">{row.original.pension_system.name}</Badge>
      ) : (
        <span className="text-muted-foreground text-xs">Sin asignar</span>
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
];
