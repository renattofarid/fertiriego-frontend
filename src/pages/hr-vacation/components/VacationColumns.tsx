import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { ClipboardCheck } from "lucide-react";
import type { VacationResource } from "../lib/vacation.interface";

const STATUS_VARIANT: Record<string, "yellow" | "green" | "red" | "gray"> = {
  PENDIENTE: "yellow",
  APROBADO: "green",
  RECHAZADO: "red",
  CANCELADO: "gray",
};

export const VacationColumns = ({
  onReview,
}: {
  onReview: (vacation: VacationResource) => void;
}): ColumnDef<VacationResource>[] => [
  {
    accessorKey: "person_name",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    id: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.start_date} - {row.original.end_date}
      </span>
    ),
  },
  {
    accessorKey: "days_requested",
    header: "Días",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as number}</Badge>
    ),
  },
  {
    accessorKey: "period_year",
    header: "Periodo Vacacional",
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ getValue }) => (
      <span
        className="text-sm truncate max-w-[220px] block"
        title={(getValue() as string) || ""}
      >
        {(getValue() as string) || "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={STATUS_VARIANT[status] ?? "gray"}>{status}</Badge>
      );
    },
  },
  {
    accessorKey: "requested_by",
    header: "Solicitado por",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {getValue() as string}
      </span>
    ),
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
      row.original.status === "PENDIENTE" || row.original.status === "APROBADO" ? (
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
