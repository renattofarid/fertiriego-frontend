import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { Eye } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { PayrollResource } from "../lib/payroll.interface";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  BORRADOR: "secondary",
  CERRADO: "default",
};

export const PayrollColumns = ({
  onView,
}: {
  onView: (payroll: PayrollResource) => void;
}): ColumnDef<PayrollResource>[] => [
  {
    accessorKey: "period_label",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.period_label}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status}</Badge>
      );
    },
  },
  {
    accessorKey: "payslips_count",
    header: "Boletas",
  },
  {
    accessorKey: "total_gross",
    header: "Total Bruto",
    cell: ({ getValue }) => (
      <span className="font-medium">
        {formatCurrency(Number(getValue()), { currencySymbol: "S/" })}
      </span>
    ),
  },
  {
    accessorKey: "total_deductions",
    header: "Total Descuentos",
    cell: ({ getValue }) => (
      <span className="font-medium text-red-600">
        -{formatCurrency(Number(getValue()), { currencySymbol: "S/" })}
      </span>
    ),
  },
  {
    accessorKey: "total_net",
    header: "Total Neto",
    cell: ({ getValue }) => (
      <span className="font-semibold text-green-600">
        {formatCurrency(Number(getValue()), { currencySymbol: "S/" })}
      </span>
    ),
  },
  {
    accessorKey: "created_by",
    header: "Creado Por",
    cell: ({ getValue }) => (getValue() as string) || "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ColumnActions>
        <ButtonAction
          icon={Eye}
          tooltip="Ver boletas"
          onClick={() => onView(row.original)}
        />
      </ColumnActions>
    ),
  },
];
