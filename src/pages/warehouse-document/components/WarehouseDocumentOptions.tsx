"use client";

import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DOCUMENT_TYPES, DOCUMENT_STATUS } from "../lib/warehouse-document.constants";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import { useAllProducts } from "@/pages/product/lib/product.hook";

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
  selectedProduct: string;
  setSelectedProduct: (value:string) => void;
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
  selectedProduct,
  setSelectedProduct,
}: WarehouseDocumentOptionsProps) {
  const {data: products, isLoading: isLoadingProducts} = useAllProducts();
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
      <div className="w-full sm:w-[250px]">
        <SearchableSelect
          options={
            products?.map((product: any) => {
              const shortName = product.name.length > 40 
                ? `${product.name.substring(0, 40)}...` 
                : product.name;

              return {
                value: product.id.toString(),
                label: shortName,
              };
            }) || []
          }
          value={selectedProduct}
          onChange={setSelectedProduct}
          placeholder={isLoadingProducts ? "Cargando..." : "Todos los productos"}
          disabled={isLoadingProducts}
        />
      </div>
    </div>
  );
}
