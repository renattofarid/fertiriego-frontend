import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { Eye, FileDown, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { PayslipResource } from "../lib/payroll.interface";

function money(value: string | number) {
  return formatCurrency(Number(value), { currencySymbol: "S/" });
}

export const PayslipColumns = ({
  selectedIds,
  onToggleSelect,
  onView,
  onDownload,
  onRecalculate,
}: {
  selectedIds: number[];
  onToggleSelect: (personId: number) => void;
  onView: (payslip: PayslipResource) => void;
  onDownload: (payslip: PayslipResource) => void;
  onRecalculate: (payslip: PayslipResource) => void;
}): ColumnDef<PayslipResource>[] => [
  {
    id: "select",
    header: "",
    cell: ({ row }) => (
      <Checkbox
        checked={selectedIds.includes(row.original.person_id)}
        onCheckedChange={() => onToggleSelect(row.original.person_id)}
      />
    ),
  },
  {
    accessorKey: "person_name",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "gross_salary",
    header: "Bruto",
    cell: ({ getValue }) => money(getValue() as string),
  },
  {
    accessorKey: "total_deductions",
    header: "Descuentos",
    cell: ({ getValue }) => (
      <span className="text-red-600">-{money(getValue() as string)}</span>
    ),
  },
  {
    accessorKey: "net_salary",
    header: "Neto",
    cell: ({ getValue }) => (
      <span className="font-semibold text-green-600">
        {money(getValue() as string)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={status === "ENVIADO" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ColumnActions>
        <ButtonAction
          icon={Eye}
          tooltip="Ver boleta"
          onClick={() => onView(row.original)}
        />
        <ButtonAction
          icon={FileDown}
          tooltip="Descargar PDF"
          onClick={() => onDownload(row.original)}
        />
        <ButtonAction
          icon={Calculator}
          tooltip="Recalcular"
          onClick={() => onRecalculate(row.original)}
        />
      </ColumnActions>
    ),
  },
];
