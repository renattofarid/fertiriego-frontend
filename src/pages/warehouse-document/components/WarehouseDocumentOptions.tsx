"use client";

import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DOCUMENT_TYPES, DOCUMENT_STATUS } from "../lib/warehouse-document.constants";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";

interface WarehouseDocumentOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedWarehouse: string;
  setSelectedWarehouse: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  warehouses: WarehouseResource[];
}

export default function WarehouseDocumentOptions({
  search,
  setSearch,
  selectedWarehouse,
  setSelectedWarehouse,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  warehouses,
}: WarehouseDocumentOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar documento"
      />

      <SearchableSelect
        options={warehouses.map((warehouse) => ({
          value: warehouse.id.toString(),
          label: warehouse.name,
        }))}
        value={selectedWarehouse}
        onChange={setSelectedWarehouse}
        placeholder="Todos los almacenes"
      />

      <SearchableSelect
        options={DOCUMENT_TYPES.map((type) => ({
          value: type.value,
          label: type.label,
        }))}
        value={selectedType}
        onChange={setSelectedType}
        placeholder="Todos los tipos"
      />

      <SearchableSelect
        options={DOCUMENT_STATUS.map((status) => ({
          value: status.value,
          label: status.label,
        }))}
        value={selectedStatus}
        onChange={setSelectedStatus}
        placeholder="Todos los estados"
      />
    </div>
  );
}
