import { useState } from "react";
import { CalendarCheck2, CalendarClock, Settings2 } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SummaryCard } from "@/components/SummaryCard";
import FormSkeleton from "@/components/FormSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ColumnDef } from "@tanstack/react-table";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useVacationControlSummary } from "../lib/vacation.hook";
import { VACATION_CONTROL_META } from "../lib/vacation.interface";
import type { VacationPeriodSummary } from "../lib/vacation.interface";
import VacationControlModal from "./VacationControlModal";
import VacationPeriodsTable from "./VacationPeriodsTable";

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

const periodColumns: ColumnDef<VacationPeriodSummary>[] = [
  { accessorKey: "period_year", header: "Año" },
  {
    id: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.period_start} - {row.original.period_end}
      </span>
    ),
  },
  { accessorKey: "days_entitled", header: "Otorgados" },
  { accessorKey: "days_used", header: "Usados" },
  { accessorKey: "days_pending", header: "Pendientes" },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => <Badge variant="outline">{getValue() as string}</Badge>,
  },
];

export default function VacationControlPage() {
  const [personId, setPersonId] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
  const workers = useAllWorkers();

  const { data, isLoading } = useVacationControlSummary(
    personId ? Number(personId) : undefined,
  );

  const summary = data?.data;

  return (
    <div className="space-y-4">
      <TitleComponent
        title={VACATION_CONTROL_META.MODEL.name}
        subtitle={VACATION_CONTROL_META.MODEL.description}
        icon={VACATION_CONTROL_META.ICON}
      />

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen por Trabajador</TabsTrigger>
          <TabsTrigger value="periodos">Todos los Períodos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchableSelect
              options={(workers || []).map((p) => ({
                value: p.id.toString(),
                label: getPersonDisplayName(p),
              }))}
              value={personId}
              onChange={setPersonId}
              placeholder="Seleccione un trabajador"
              className="w-72"
            />
            <Button
              variant="outline"
              disabled={!personId}
              onClick={() => setConfigOpen(true)}
            >
              <Settings2 className="size-4 mr-2" /> Configurar
            </Button>
          </div>

          {!personId && (
            <p className="text-sm text-muted-foreground">
              Seleccione un trabajador para ver su control de vacaciones.
            </p>
          )}

          {personId && isLoading && <FormSkeleton />}

          {personId && summary && (
            <>
              <Card>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-semibold">{summary.worker.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Fecha de ingreso: {summary.worker.hire_date || "No registrada"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {summary.worker.vacation_days_per_year} días / año
                  </Badge>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SummaryCard
                  icon={<CalendarCheck2 className="size-4" />}
                  label="Días Otorgados"
                  value={summary.summary.total_entitled}
                  color="green"
                />
                <SummaryCard
                  icon={<CalendarClock className="size-4" />}
                  label="Días Usados"
                  value={summary.summary.total_used}
                  color="blue"
                />
                <SummaryCard
                  icon={<CalendarClock className="size-4" />}
                  label="Días Pendientes"
                  value={summary.summary.total_pending}
                  color="amber"
                />
              </div>

              {summary.current_period && (
                <Card>
                  <CardContent className="space-y-1">
                    <p className="text-sm font-medium">
                      Periodo Actual: {summary.current_period.period_year}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary.current_period.period_start} -{" "}
                      {summary.current_period.period_end}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Otorgados: {summary.current_period.days_entitled} · Usados:{" "}
                      {summary.current_period.days_used} · Pendientes:{" "}
                      {summary.current_period.days_pending}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="border-none text-muted-foreground max-w-full">
                <DataTable
                  columns={periodColumns}
                  data={summary.periods || []}
                  initialColumnVisibility={{}}
                  isVisibleColumnFilter={false}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="periodos">
          <VacationPeriodsTable />
        </TabsContent>
      </Tabs>

      {configOpen && personId && (
        <VacationControlModal
          personId={Number(personId)}
          open={configOpen}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </div>
  );
}
