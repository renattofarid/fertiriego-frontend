"use client";

import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";

export default function SaleOptions({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  search: string;
  setSearch: (value: string) => void;
  startDate?: string;
  setStartDate?: (value: string) => void;
  endDate?: string;
  setEndDate?: (value: string) => void;
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
    </div>
  );
}
