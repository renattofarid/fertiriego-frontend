import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { ClipboardCheck } from "lucide-react";
import type { JustificationResource } from "../lib/justification.interface";

const TYPE_LABELS: Record<string, string> = {
  PERMISO: "Permiso",
  VACACIONES: "Vacaciones",
  ENFERMEDAD: "Enfermedad",
  FALTA_JUSTIFICADA: "Falta Justificada",
  OTRO: "Otro",
};

const STATUS_VARIANT: Record<string, "yellow" | "green" | "red"> = {
  PENDIENTE: "yellow",
  APROBADO: "green",
  RECHAZADO: "red",
};

export const JustificationColumns = ({
  onReview,
}: {
  onReview: (justification: JustificationResource) => void;
}): ColumnDef<JustificationResource>[] => [
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
        {row.original.date_from} - {row.original.date_until}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return <Badge variant="outline">{TYPE_LABELS[type] ?? type}</Badge>;
    },
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ getValue }) => (
      <span className="text-sm truncate max-w-[220px] block" title={getValue() as string}>
        {getValue() as string}
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
