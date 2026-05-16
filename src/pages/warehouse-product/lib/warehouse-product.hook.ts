import { useEffect } from "react";
import { useWarehouseProductStore } from "./warehouse-product.store";
import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import { getWarehouseProduct,updateWarehouseProductStock } from "./warehouse-product.actions";
import { WAREHOUSE_PRODUCT } from "./warehouse-product.interface";
import { successToast, errorToast } from "@/lib/core.function";

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

export function useUpdateWarehouseProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      updateWarehouseProductStock(id, { stock }),
    onSuccess: () => {
      successToast("Stock actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_PRODUCT.QUERY_KEY] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error al actualizar el stock";
      errorToast(message);
    },
  });
}