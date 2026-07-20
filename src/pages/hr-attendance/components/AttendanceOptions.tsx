"use client";

import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";

const STATUS_OPTIONS = [
  { value: "PRESENTE", label: "Presente" },
  { value: "TARDANZA", label: "Tardanza" },
  { value: "FALTA", label: "Falta" },
  { value: "JUSTIFICADO", label: "Justificado" },
  { value: "MEDIO_DIA", label: "Medio Día" },
  { value: "DESCANSO", label: "Descanso" },
];

function getPersonDisplayName(person: PersonResource) {
  return person.type_document === "RUC"
    ? person.business_name
    : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();
}

interface Props {
  dateFrom?: Date;
  dateTo?: Date;
  onDateChange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  personId: string;
  setPersonId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export default function AttendanceOptions({
  dateFrom,
  dateTo,
  onDateChange,
  personId,
  setPersonId,
  status,
  setStatus,
}: Props) {
  const workers = useAllWorkers();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={onDateChange}
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
  );
}
