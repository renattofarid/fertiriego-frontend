import { useEffect } from "react";
import { useWarehouseProductStore } from "./warehouse-product.store";
import { useQuery } from "@tanstack/react-query";
import { getWarehouseProduct } from "./warehouse-product.actions";
import { WAREHOUSE_PRODUCT } from "./warehouse-product.interface";

export function useWarehouseProducts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [WAREHOUSE_PRODUCT.QUERY_KEY, params],
    queryFn: () => getWarehouseProduct({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useWarehouseProductById(id: number) {
  const { warehouseProduct, isFinding, error, fetchWarehouseProduct } =
    useWarehouseProductStore();

  useEffect(() => {
    fetchWarehouseProduct(id);
  }, [id]);

  return {
    data: warehouseProduct,
    isFinding,
    error,
    refetch: () => fetchWarehouseProduct(id),
  };
}
