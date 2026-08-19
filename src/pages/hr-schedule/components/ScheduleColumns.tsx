import type { ScheduleResource } from "../lib/schedule.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { CalendarClock, Percent } from "lucide-react";

export const ScheduleColumns = ({
  onAssign,
  onSetOvertimeRate,
}: {
  onAssign: (schedule: ScheduleResource) => void;
  onSetOvertimeRate?: (schedule: ScheduleResource) => void;
}): ColumnDef<ScheduleResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "check_in_time",
    header: "Hora Entrada",
    cell: ({ getValue }) => (
      <Badge variant="blue">{(getValue() as string)?.slice(0, 5)}</Badge>
    ),
  },
  {
    accessorKey: "check_out_time",
    header: "Hora Salida",
    cell: ({ getValue }) => (
      <Badge variant="purple">{(getValue() as string)?.slice(0, 5)}</Badge>
    ),
  },
  {
    accessorKey: "tolerance_minutes",
    header: "Tolerancia",
    cell: ({ getValue }) => <span>{getValue() as number} min</span>,
  },
  {
    accessorKey: "min_hours",
    header: "Horas Mínimas",
    cell: ({ getValue }) => <span>{getValue() as number} h</span>,
  },
  {
    accessorKey: "overtime_rate",
    header: "Tasa H. Extra",
    cell: ({ getValue }) => (
      <Badge variant="outline">x{(getValue() as number) ?? 1}</Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean;
      return (
        <Badge variant={isActive ? "green" : "gray"}>
          {isActive ? "Activo" : "Inactivo"}
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
          icon={CalendarClock}
          tooltip="Asignar a trabajador"
          onClick={() => onAssign(row.original)}
        />
        {onSetOvertimeRate && (
          <ButtonAction
            icon={Percent}
            tooltip="Tasa de horas extras"
            onClick={() => onSetOvertimeRate(row.original)}
          />
        )}
      </ColumnActions>
    ),
  },
];
