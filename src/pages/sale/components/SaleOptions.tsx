"use client";

import SearchInput from "@/components/SearchInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar venta"
      />

      {setStartDate && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="start-date" className="text-xs">Fecha Inicio</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate || ""}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
      )}

      {setEndDate && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="end-date" className="text-xs">Fecha Fin</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      )}
    </div>
  );
}
