"use client";

import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";

export default function WarehouseProductOptions({
  search,
  setSearch,
  warehouseId,
  setWarehouseId,
  productId,
  setProductId,
  warehouses,
}: {
  search: string;
  setSearch: (value: string) => void;
  warehouseId: string;
  setWarehouseId: (value: string) => void;
  productId: string;
  setProductId: (value: string) => void;
  warehouses: WarehouseResource[];
}) {
  const warehouseOptions = [
    { value: "", label: "Todos los almacenes" },
    ...(warehouses?.map((warehouse) => ({
      value: warehouse.id.toString(),
      label: warehouse.name,
    })) || []),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto o almacén"
      />

      <SearchableSelect
        options={warehouseOptions}
        value={warehouseId}
        onChange={setWarehouseId}
        placeholder="Todos los almacenes"
      />

      <SearchableSelectAsync
        useQueryHook={useProduct}
        mapOptionFn={(product) => ({
          value: product.id.toString(),
          label: product.name,
        })}
        value={productId}
        onChange={setProductId}
        placeholder="Todos los productos"
      />
    </div>
  );
}
