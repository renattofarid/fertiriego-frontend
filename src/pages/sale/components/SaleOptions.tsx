"use client";
import DatePicker from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import SearchInput from "@/components/SearchInput";
import FilterWrapper from "@/components/FilterWrapper";
import type { Option } from "@/lib/core.interface";
import { useClients } from "@/pages/client/lib/client.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";

const sunatStatusOptions: Option[] = [
  { value: "", label: "Todos los estados SUNAT" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ACEPTADO", label: "Aceptado" },
  { value: "BAJA", label: "Baja" },
  { value: "RECHAZADO", label: "Rechazado" },
];

const mapClientOption = (person: PersonResource): Option => ({
  value: String(person.id),
  label: person.names,
  description: person.number_document,
});

export default function SaleOptions({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusSunat,
  setStatusSunat,
  customerId,
  setCustomerId,
}: {
  search: string;
  setSearch: (value: string) => void;
  startDate?: string;
  setStartDate?: (value: string) => void;
  endDate?: string;
  setEndDate?: (value: string) => void;
  statusSunat?: string;
  setStatusSunat?: (value: string) => void;
  customerId?: string;
  setCustomerId?: (value: string) => void;
}) {
  const handleStartDateChange = (date: Date | undefined) => {
    if (setStartDate) {
      setStartDate(date ? date.toISOString().split("T")[0] : "");
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (setEndDate) {
      setEndDate(date ? date.toISOString().split("T")[0] : "");
    }
  };

  // Count active extra filters for badge
  const activeExtraCount = [statusSunat].filter(Boolean).length;

  return (
    <FilterWrapper activeExtraCount={activeExtraCount}>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar venta"
      />

      {setStartDate && (
        <DatePicker
          value={startDate}
          onChange={handleStartDateChange}
          placeholder="Fecha Inicio (from)"
          className="w-52"
        />
      )}

      {setEndDate && (
        <DatePicker
          value={endDate}
          onChange={handleEndDateChange}
          placeholder="Fecha Fin (to)"
          className="w-52"
        />
      )}

      {setCustomerId && (
        <SearchableSelectAsync
          value={customerId ?? ""}
          onChange={setCustomerId}
          placeholder="Cliente"
          className="w-full md:w-[220px]"
          useQueryHook={useClients}
          mapOptionFn={mapClientOption}
        />
      )}

      {setStatusSunat && (
        <SearchableSelect
          options={sunatStatusOptions}
          value={statusSunat ?? ""}
          onChange={setStatusSunat}
          placeholder="Estado SUNAT"
          className="w-full md:w-[200px]"
        />
      )}
    </FilterWrapper>
  );
}
