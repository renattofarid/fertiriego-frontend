import SearchInput from "@/components/SearchInput";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import type { Option } from "@/lib/core.interface";
import { useClients } from "@/pages/client/lib/client.hook";
import { useCarriers } from "@/pages/carrier/lib/carrier.hook";
import { useDrivers } from "@/pages/driver/lib/driver.hook";
import { useVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import { useWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useGuideMotives } from "../lib/guide.hook";

export interface GuideFilters {
  search: string;
  status: string;
  warehouse_id: string;
  recipient_id: string;
  carrier_id: string;
  driver_id: string;
  vehicle_id: string;
  motive_id: string;
  issue_date_from?: Date;
  issue_date_to?: Date;
  transfer_date_from?: Date;
  transfer_date_to?: Date;
}

export const EMPTY_GUIDE_FILTERS: GuideFilters = {
  search: "",
  status: "",
  warehouse_id: "",
  recipient_id: "",
  carrier_id: "",
  driver_id: "",
  vehicle_id: "",
  motive_id: "",
};

const STATUS_OPTIONS: Option[] = [
  { value: "", label: "Todos los estados" },
  { value: "EMITIDA", label: "Emitida" },
  { value: "EN_TRANSITO", label: "En tránsito" },
  { value: "RECIBIDA", label: "Recibida" },
  { value: "ANULADA", label: "Anulada" },
];

const personName = (p: any) =>
  p.business_name ||
  `${p.names ?? ""} ${p.father_surname ?? ""} ${p.mother_surname ?? ""}`.trim();

const mapPersonOption = (p: any): Option => ({
  value: String(p.id),
  label: personName(p),
  description: p.number_document || "",
});

interface GuideOptionsProps {
  filters: GuideFilters;
  onChange: (changes: Partial<GuideFilters>) => void;
}

export default function GuideOptions({ filters, onChange }: GuideOptionsProps) {
  const { data: motives } = useGuideMotives();

  const motiveOptions: Option[] = [
    { value: "", label: "Todos los motivos" },
    ...(motives ?? []).map((m) => ({ value: String(m.id), label: m.name })),
  ];

  return (
    <FilterWrapper>
      <SearchInput
        value={filters.search}
        onChange={(value) => onChange({ search: value })}
        placeholder="Buscar..."
      />

      <SearchableSelectAsync
        value={filters.recipient_id}
        onChange={(value) => onChange({ recipient_id: value })}
        placeholder="Destinatario"
        useQueryHook={useClients}
        mapOptionFn={mapPersonOption}
      />

      <SearchableSelect
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(value) => onChange({ status: value })}
        placeholder="Estado"
        className="w-full md:w-[160px]"
      />

      <SearchableSelectAsync
        value={filters.warehouse_id}
        onChange={(value) => onChange({ warehouse_id: value })}
        placeholder="Almacén"
        useQueryHook={useWarehouses}
        mapOptionFn={(w: any) => ({ value: String(w.id), label: w.name })}
      />

      <SearchableSelectAsync
        value={filters.carrier_id}
        onChange={(value) => onChange({ carrier_id: value })}
        placeholder="Transportista"
        useQueryHook={useCarriers}
        mapOptionFn={mapPersonOption}
      />

      <SearchableSelectAsync
        value={filters.driver_id}
        onChange={(value) => onChange({ driver_id: value })}
        placeholder="Conductor"
        useQueryHook={useDrivers}
        mapOptionFn={mapPersonOption}
      />

      <SearchableSelectAsync
        value={filters.vehicle_id}
        onChange={(value) => onChange({ vehicle_id: value })}
        placeholder="Vehículo"
        useQueryHook={useVehicles}
        mapOptionFn={(v: any) => ({
          value: String(v.id),
          label: v.plate,
          description: `${v.brand ?? ""} ${v.model ?? ""}`.trim(),
        })}
      />

      <SearchableSelect
        options={motiveOptions}
        value={filters.motive_id}
        onChange={(value) => onChange({ motive_id: value })}
        placeholder="Motivo"
        className="w-full md:w-[180px]"
      />

      <DateRangePickerFilter
        dateFrom={filters.issue_date_from}
        dateTo={filters.issue_date_to}
        onDateChange={(from, to) =>
          onChange({ issue_date_from: from, issue_date_to: to })
        }
        placeholder="Fecha de emisión"
        className="md:w-[240px]"
      />

      <DateRangePickerFilter
        dateFrom={filters.transfer_date_from}
        dateTo={filters.transfer_date_to}
        onDateChange={(from, to) =>
          onChange({ transfer_date_from: from, transfer_date_to: to })
        }
        placeholder="Fecha de traslado"
        className="md:w-[240px]"
      />
    </FilterWrapper>
  );
}
