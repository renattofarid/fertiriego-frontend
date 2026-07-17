"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterWrapper from "@/components/FilterWrapper";
import type { AlertsFilters } from "../lib/predictive.interface";

interface Props {
  filters: AlertsFilters;
  onChange: (filters: AlertsFilters) => void;
  warehouses: { id: number; name: string }[];
}

export default function PredictiveAlertsOptions({
  filters,
  onChange,
  warehouses,
}: Props) {
  return (
    <FilterWrapper>
      <Select
        value={filters.urgency ?? "all"}
        onValueChange={(v) =>
          onChange({ ...filters, urgency: v === "all" ? null : v })
        }
      >
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue placeholder="Urgencia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las urgencias</SelectItem>
          <SelectItem value="CRITICO">Crítico</SelectItem>
          <SelectItem value="ADVERTENCIA">Advertencia</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.warehouse_id ? String(filters.warehouse_id) : "all"}
        onValueChange={(v) =>
          onChange({ ...filters, warehouse_id: v === "all" ? null : v })
        }
      >
        <SelectTrigger className="w-[200px] h-8 text-xs">
          <SelectValue placeholder="Almacén" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los almacenes</SelectItem>
          {warehouses.map((w) => (
            <SelectItem key={w.id} value={String(w.id)}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterWrapper>
  );
}
