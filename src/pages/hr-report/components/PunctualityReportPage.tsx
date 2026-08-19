import { useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import {
  ListChecks,
  UserCheck,
  Clock3,
  UserX,
  FileCheck2,
  CalendarClock,
  Timer,
  Hourglass,
  AlarmClockCheck,
} from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { ButtonAction } from "@/components/ButtonAction";
import { ColumnActions } from "@/components/SelectActions";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SummaryCard } from "@/components/SummaryCard";
import GeneralSheet from "@/components/GeneralSheet";
import type { ColumnDef } from "@tanstack/react-table";
import { usePunctualityReport, useIncidentsStats } from "../lib/report.hook";
import type { PunctualityWorkerRow } from "../lib/report.interface";
import { STATUS_BADGE_VARIANT } from "../lib/status-badge";
import { PUNCTUALITY_META } from "../lib/report.interface";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

export default function PunctualityReportPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(new Date()),
  );
  const [personId, setPersonId] = useState("");
  const [incidentsWorker, setIncidentsWorker] =
    useState<PunctualityWorkerRow | null>(null);

  const workers = useAllWorkers();

  const params = {
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
    person_id: personId ? Number(personId) : undefined,
  };

  const { data: punctualityData, isLoading } = usePunctualityReport(params);
  const { data: statsData } = useIncidentsStats(params);

  const stats = statsData?.data;

  const columns: ColumnDef<PunctualityWorkerRow>[] = [
    {
      id: "worker",
      header: "Trabajador",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.worker.full_name}</span>
      ),
    },
    {
      accessorKey: "late_count",
      header: "Tardanzas",
      cell: ({ getValue }) => <Badge variant="yellow">{getValue() as number}</Badge>,
    },
    {
      accessorKey: "absent_count",
      header: "Faltas",
      cell: ({ getValue }) => <Badge variant="red">{getValue() as number}</Badge>,
    },
    {
      accessorKey: "half_day_count",
      header: "Medio Día",
      cell: ({ getValue }) => (
        <Badge variant="orange">{getValue() as number}</Badge>
      ),
    },
    {
      accessorKey: "justified_count",
      header: "Justificados",
      cell: ({ getValue }) => <Badge variant="blue">{getValue() as number}</Badge>,
    },
    {
      accessorKey: "total_late_minutes",
      header: "Min. Tarde",
      cell: ({ getValue }) => `${getValue() as number} min`,
    },
    {
      id: "actions",
      header: "Incidencias",
      cell: ({ row }) => (
        <ColumnActions>
          <ButtonAction
            icon={ListChecks}
            tooltip="Ver incidencias"
            onClick={() => setIncidentsWorker(row.original)}
          />
        </ColumnActions>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <TitleComponent
          title={PUNCTUALITY_META.MODEL.name}
          subtitle={PUNCTUALITY_META.MODEL.description}
          icon={PUNCTUALITY_META.ICON}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePickerFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            className="w-56"
          />
          <SearchableSelect
            options={(workers || []).map((p) => ({
              value: p.id.toString(),
              label: getPersonDisplayName(p),
            }))}
            value={personId}
            onChange={setPersonId}
            placeholder="Todos los trabajadores"
            className="w-56"
          />
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <SummaryCard
            icon={<UserCheck className="size-4" />}
            label="Presente"
            value={`${stats.totals.present} (${stats.percentages.present}%)`}
            color="green"
          />
          <SummaryCard
            icon={<Clock3 className="size-4" />}
            label="Tardanza"
            value={`${stats.totals.late} (${stats.percentages.late}%)`}
            color="yellow"
          />
          <SummaryCard
            icon={<UserX className="size-4" />}
            label="Falta"
            value={`${stats.totals.absent} (${stats.percentages.absent}%)`}
            color="red"
          />
          <SummaryCard
            icon={<FileCheck2 className="size-4" />}
            label="Justificado"
            value={`${stats.totals.justified} (${stats.percentages.justified}%)`}
            color="blue"
          />
          <SummaryCard
            icon={<CalendarClock className="size-4" />}
            label="Medio Día"
            value={`${stats.totals.half_day} (${stats.percentages.half_day}%)`}
            color="orange"
          />
          <SummaryCard
            icon={<Timer className="size-4" />}
            label="Horas Trabajadas"
            value={stats.hours.total_worked}
            color="emerald"
          />
          <SummaryCard
            icon={<Hourglass className="size-4" />}
            label="Horas Tarde"
            value={stats.hours.total_late}
            color="amber"
          />
          <SummaryCard
            icon={<AlarmClockCheck className="size-4" />}
            label="Prom. Min. Tarde"
            value={String(stats.hours.avg_late_minutes)}
            color="purple"
          />
        </div>
      )}

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={columns}
          data={punctualityData?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        />
      </div>

      <GeneralSheet
        open={!!incidentsWorker}
        onClose={() => setIncidentsWorker(null)}
        title={`Incidencias - ${incidentsWorker?.worker.full_name ?? ""}`}
        subtitle="Detalle de incidencias en el periodo seleccionado"
      >
        <div className="space-y-2 py-2">
          {incidentsWorker?.incidents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay incidencias registradas.
            </p>
          )}
          {incidentsWorker?.incidents.map((incident, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{incident.date}</p>
                <p className="text-xs text-muted-foreground">
                  {incident.check_in
                    ? `Entrada: ${incident.check_in}`
                    : "Sin marcación"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={
                    (STATUS_BADGE_VARIANT[incident.status] as any) ?? "gray"
                  }
                >
                  {incident.status}
                </Badge>
                {incident.late_minutes > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {incident.late_minutes} min tarde
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </GeneralSheet>
    </div>
  );
}
