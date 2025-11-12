"use client";

import SearchInput from "@/components/SearchInput";
import { FormSelect } from "@/components/FormSelect";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useForm } from "react-hook-form";

export default function WarehouseProductOptions({
  search,
  setSearch,
  warehouseId,
  setWarehouseId,
  productId,
  setProductId,
}: {
  search: string;
  setSearch: (value: string) => void;
  warehouseId: string;
  setWarehouseId: (value: string) => void;
  productId: string;
  setProductId: (value: string) => void;
}) {
  const { data: warehouses, isLoading: loadingWarehouses } = useAllWarehouses();
  const { data: products, isLoading: loadingProducts } = useAllProducts();

  const form = useForm();

  const warehouseOptions = [
    { value: "", label: "Todos los almacenes" },
    ...(warehouses?.map((warehouse) => ({
      value: warehouse.id.toString(),
      label: warehouse.name,
    })) || []),
  ];

  const productOptions = [
    { value: "", label: "Todos los productos" },
    ...(products?.map((product) => ({
      value: product.id.toString(),
      label: product.name,
    })) || []),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto o almacén"
      />

      <div className="min-w-[200px]">
        <FormSelect
          name="warehouse_filter"
          placeholder="Filtrar por almacén"
          options={warehouseOptions}
          control={form.control}
          disabled={loadingWarehouses}
          value={warehouseId}
          onChange={(value) => setWarehouseId(value)}
        />
      </div>

      <div className="min-w-[200px]">
        <FormSelect
          name="product_filter"
          placeholder="Filtrar por producto"
          options={productOptions}
          control={form.control}
          disabled={loadingProducts}
          value={productId}
          onChange={(value) => setProductId(value)}
        />
      </div>
    </div>
  );
}
