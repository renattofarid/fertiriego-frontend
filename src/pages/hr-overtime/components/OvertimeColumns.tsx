import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { ClipboardCheck } from "lucide-react";
import type { OvertimeResource } from "../lib/overtime.interface";

const STATUS_VARIANT: Record<string, "yellow" | "green" | "red" | "gray"> = {
  PENDIENTE: "yellow",
  APROBADO: "green",
  RECHAZADO: "red",
};

interface OvertimeColumnsProps {
  onReview: (overtime: OvertimeResource) => void;
  enableSelection?: boolean;
}

export const OvertimeColumns = ({
  onReview,
  enableSelection = false,
}: OvertimeColumnsProps): ColumnDef<OvertimeResource>[] => [
  ...(enableSelection
    ? [
        {
          id: "select",
          header: ({ table }: any) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value: boolean) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Seleccionar todo"
            />
          ),
          cell: ({ row }: any) =>
            row.original.status === "PENDIENTE" ? (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
              />
            ) : null,
          enableSorting: false,
        } as ColumnDef<OvertimeResource>,
      ]
    : []),
  {
    accessorKey: "person_name",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Fecha",
  },
  {
    id: "schedule",
    header: "Horario",
    cell: ({ row }) => row.original.schedule?.name ?? "-",
  },
  {
    id: "minutes",
    header: "Min. Trabajados",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.minutes_worked} / {row.original.scheduled_minutes}
      </span>
    ),
  },
  {
    accessorKey: "overtime_hours",
    header: "Horas Extra",
    cell: ({ row }) => (
      <Badge variant="blue">
        {row.original.overtime_hours} h ({row.original.overtime_minutes} min)
      </Badge>
    ),
  },
  {
    accessorKey: "rate_factor",
    header: "Tasa",
    cell: ({ getValue }) => (
      <Badge variant="outline">x{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => (
      <span className="text-sm font-medium">S/ {getValue() as string}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <Badge variant={STATUS_VARIANT[status] ?? "gray"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "reviewed_by",
    header: "Revisado por",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {(getValue() as string) || "-"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      row.original.status === "PENDIENTE" ? (
        <ColumnActions>
          <ButtonAction
            icon={ClipboardCheck}
            tooltip="Revisar"
            onClick={() => onReview(row.original)}
          />
        </ColumnActions>
      ) : null,
  },
];
