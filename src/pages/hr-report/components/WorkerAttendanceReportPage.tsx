import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startOfMonth, endOfMonth, format } from "date-fns";
import {
  ArrowLeft,
  CalendarRange,
  UserCheck,
  UserX,
  Clock3,
  FileCheck2,
  Timer,
  AlarmClockCheck,
  Percent,
} from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SummaryCard } from "@/components/SummaryCard";
import type { ColumnDef } from "@tanstack/react-table";
import { useWorkerReport } from "../lib/report.hook";
import type { WorkerReportDetail } from "../lib/report.interface";
import { STATUS_BADGE_VARIANT } from "../lib/status-badge";

const detailColumns: ColumnDef<WorkerReportDetail>[] = [
  { accessorKey: "date", header: "Fecha" },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={(STATUS_BADGE_VARIANT[status] as any) ?? "gray"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "first_check_in",
    header: "Primera Entrada",
    cell: ({ getValue }) => (getValue() as string) || "-",
  },
  {
    accessorKey: "last_check_out",
    header: "Última Salida",
    cell: ({ getValue }) => (getValue() as string) || "-",
  },
  { accessorKey: "hours_worked", header: "Horas Trabajadas" },
  {
    accessorKey: "late_minutes",
    header: "Min. Tarde",
    cell: ({ getValue }) => `${getValue() as number} min`,
  },
  {
    id: "schedule",
    header: "Horario",
    cell: ({ row }) => row.original.schedule?.name ?? "-",
  },
];

export default function WorkerAttendanceReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(new Date()),
  );

  const { data, isLoading } = useWorkerReport(Number(id), {
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
  });

  const report = data?.data;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <TitleComponent
            title={report?.worker?.full_name ?? "Reporte de Asistencia"}
            subtitle="Reporte de asistencia del trabajador"
            icon="FileClock"
          />
        </div>
        <DateRangePickerFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
          className="w-56"
        />
      </div>

      {report && (
         <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <SummaryCard
            icon={<CalendarRange className="size-4" />}
            label="Días del Periodo"
            value={String(report.summary.total_days)}
            color="blue"
          />
          <SummaryCard
            icon={<UserCheck className="size-4" />}
            label="Presentes"
            value={String(report.summary.present_days)}
            color="green"
          />
          <SummaryCard
            icon={<UserX className="size-4" />}
            label="Faltas"
            value={String(report.summary.absent_days)}
            color="red"
          />
          <SummaryCard
            icon={<Clock3 className="size-4" />}
            label="Tardanzas"
            value={String(report.summary.late_days)}
            color="yellow"
          />
          <SummaryCard
            icon={<FileCheck2 className="size-4" />}
            label="Justificados"
            value={String(report.summary.justified_days)}
            color="orange"
          />
          <SummaryCard
            icon={<Timer className="size-4" />}
            label="Horas Trabajadas"
            value={report.summary.total_hours_worked}
            color="emerald"
          />
          <SummaryCard
            icon={<AlarmClockCheck className="size-4" />}
            label="Min. Tarde Totales"
            value={String(report.summary.total_late_minutes)}
            color="amber"
          />
          <SummaryCard
            icon={<Percent className="size-4" />}
            label="Puntualidad"
            value={`${report.summary.punctuality_rate}%`}
            color="purple"
          />
        </div>
      )}

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={detailColumns}
          data={report?.detail || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        />
      </div>
    </div>
  );
}
