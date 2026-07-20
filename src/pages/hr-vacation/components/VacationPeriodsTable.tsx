"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useVacationPeriods } from "../lib/vacation.hook";
import type { VacationPeriodResource } from "../lib/vacation.interface";

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

const STATUS_VARIANT: Record<string, "yellow" | "green" | "blue" | "gray"> = {
  PENDIENTE: "yellow",
  VIGENTE: "green",
  VENCIDO: "gray",
};

const columns: ColumnDef<VacationPeriodResource>[] = [
  {
    accessorKey: "person_name",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
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
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={STATUS_VARIANT[status] ?? "gray"}>{status}</Badge>
      );
    },
  },
];

export default function VacationPeriodsTable() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [personId, setPersonId] = useState("");
  const [year, setYear] = useState("");
  const workers = useAllWorkers();

  const params = {
    page,
    per_page,
    person_id: personId ? Number(personId) : undefined,
    year: year || undefined,
  };

  const { data, isLoading } = useVacationPeriods(params);

  useEffect(() => {
    setPage(1);
  }, [personId, year, per_page]);

  return (
    <div className="space-y-4">
      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <div className="flex items-center gap-2 flex-wrap">
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
            <Input
              type="number"
              placeholder="Año"
              className="w-28"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </DataTable>
      </div>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
