"use client";

import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { Option } from "@/lib/core.interface";

const sunatStatusOptions: Option[] = [
  { value: "", label: "Todos los estados SUNAT" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ACEPTADO", label: "Aceptado" },
  { value: "BAJA", label: "Baja" },
  { value: "RECHAZADO", label: "Rechazado" },
];

export default function SaleOptions({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusSunat,
  setStatusSunat,
}: {
  search: string;
  setSearch: (value: string) => void;
  startDate?: string;
  setStartDate?: (value: string) => void;
  endDate?: string;
  setEndDate?: (value: string) => void;
  statusSunat?: string;
  setStatusSunat?: (value: string) => void;
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

  return (
    <div className="flex items-center gap-2 flex-wrap">
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

      {setStatusSunat && (
        <SearchableSelect
          options={sunatStatusOptions}
          value={statusSunat ?? ""}
          onChange={setStatusSunat}
          placeholder="Estado SUNAT"
          className="w-full md:w-[200px]"
        />
      )}
    </div>
  );
}
