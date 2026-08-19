import { useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import {
  CalendarRange,
  CheckCircle2,
  XCircle,
  Ban,
  Clock3,
  ListChecks,
} from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SummaryCard } from "@/components/SummaryCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ColumnDef } from "@tanstack/react-table";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import {
  useScheduledVacationReport,
  useVacationBalanceReport,
  useVacationRequestsReport,
} from "../lib/vacation-report.hook";
import {
  VACATION_REPORT_META,
  type ScheduledVacationItem,
  type VacationBalanceItem,
  type VacationRequestReportItem,
} from "../lib/vacation-report.interface";

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

const STATUS_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "APROBADO", label: "Aprobado" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const STATUS_VARIANT: Record<string, "yellow" | "green" | "red" | "gray"> = {
  PENDIENTE: "yellow",
  APROBADO: "green",
  RECHAZADO: "red",
  CANCELADO: "gray",
};

const scheduledColumns: ColumnDef<ScheduledVacationItem>[] = [
  { accessorKey: "worker_name", header: "Trabajador" },
  {
    id: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.start_date} - {row.original.end_date}
      </span>
    ),
  },
  { accessorKey: "days_requested", header: "Días" },
  { accessorKey: "period_year", header: "Año Vacacional" },
];

const balanceColumns: ColumnDef<VacationBalanceItem>[] = [
  {
    id: "worker",
    header: "Trabajador",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.worker.full_name}</span>
    ),
  },
  { accessorKey: "total_entitled", header: "Otorgados" },
  { accessorKey: "total_used", header: "Usados" },
  { accessorKey: "total_pending", header: "Pendientes" },
];

const requestsColumns: ColumnDef<VacationRequestReportItem>[] = [
  {
    id: "worker",
    header: "Trabajador",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.worker.full_name}</span>
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
  { accessorKey: "days_requested", header: "Días" },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <Badge variant={STATUS_VARIANT[status] ?? "gray"}>{status}</Badge>;
    },
  },
  { accessorKey: "requested_by", header: "Solicitado por" },
];

export default function VacationReportPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(new Date()),
  );
  const [personId, setPersonId] = useState("");
  const [status, setStatus] = useState("");

  const workers = useAllWorkers();

  const params = {
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    person_id: personId ? Number(personId) : undefined,
    status: status || undefined,
  };

  const { data: scheduledData, isLoading: loadingScheduled } =
    useScheduledVacationReport(params);
  const { data: balanceData, isLoading: loadingBalance } =
    useVacationBalanceReport(params);
  const { data: requestsData, isLoading: loadingRequests } =
    useVacationRequestsReport(params);

  const totals = requestsData?.data.totals;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <TitleComponent
          title={VACATION_REPORT_META.MODEL.name}
          subtitle={VACATION_REPORT_META.MODEL.description}
          icon={VACATION_REPORT_META.ICON}
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
          <SearchableSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            placeholder="Todos los estados"
            className="w-48"
          />
        </div>
      </div>

      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled">Programadas</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="requests">Solicitudes</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              icon={<CalendarRange className="size-4" />}
              label="Total Programadas"
              value={String(scheduledData?.data.total ?? 0)}
              color="blue"
            />
          </div>
          <div className="border-none text-muted-foreground max-w-full">
            <DataTable
              columns={scheduledColumns}
              data={scheduledData?.data.data || []}
              isLoading={loadingScheduled}
              initialColumnVisibility={{}}
            />
          </div>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              icon={<ListChecks className="size-4" />}
              label="Trabajadores"
              value={String(balanceData?.total ?? 0)}
              color="primary"
            />
          </div>
          <div className="border-none text-muted-foreground max-w-full">
            <DataTable
              columns={balanceColumns}
              data={balanceData?.data || []}
              isLoading={loadingBalance}
              initialColumnVisibility={{}}
            />
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {totals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard
                icon={<Clock3 className="size-4" />}
                label="Pendientes"
                value={String(totals.PENDIENTE ?? 0)}
                color="yellow"
              />
              <SummaryCard
                icon={<CheckCircle2 className="size-4" />}
                label="Aprobadas"
                value={String(totals.APROBADO ?? 0)}
                color="green"
              />
              <SummaryCard
                icon={<XCircle className="size-4" />}
                label="Rechazadas"
                value={String(totals.RECHAZADO ?? 0)}
                color="red"
              />
              <SummaryCard
                icon={<Ban className="size-4" />}
                label="Canceladas"
                value={String(totals.CANCELADO ?? 0)}
                color="gray"
              />
            </div>
          )}
          <div className="border-none text-muted-foreground max-w-full">
            <DataTable
              columns={requestsColumns}
              data={requestsData?.data.data || []}
              isLoading={loadingRequests}
              initialColumnVisibility={{}}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
