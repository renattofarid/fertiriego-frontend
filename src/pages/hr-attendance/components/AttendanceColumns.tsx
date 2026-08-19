import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceLogResource } from "../lib/attendance.interface";

export const AttendanceColumns: ColumnDef<AttendanceLogResource>[] = [
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
    accessorKey: "time",
    header: "Hora",
    cell: ({ getValue }) => (
      <span>{(getValue() as string)?.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <Badge variant={type === "ENTRADA" ? "green" : "blue"}>{type}</Badge>
      );
    },
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "device_reference",
    header: "Dispositivo",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {(getValue() as string) || "-"}
      </span>
    ),
  },
  {
    id: "schedule",
    header: "Horario",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.schedule?.name ?? "-"}</span>
    ),
  },
  {
    accessorKey: "registered_by",
    header: "Registrado por",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {getValue() as string}
      </span>
    ),
  },
];
