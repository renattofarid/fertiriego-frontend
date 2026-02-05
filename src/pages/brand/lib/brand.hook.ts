import { useEffect } from "react";
import { useBrandStore } from "./brand.store";
import { useQuery } from "@tanstack/react-query";
import { BRAND } from "./brand.interface";
import { getBrand } from "./brand.actions";

export function useBrand(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [BRAND.QUERY_KEY, params],
    queryFn: () => getBrand({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useAllBrands() {
  const { allBrands, isLoadingAll, error, fetchAllBrands } = useBrandStore();

  useEffect(() => {
    if (!allBrands) fetchAllBrands();
  }, [allBrands, fetchAllBrands]);

  return {
    data: allBrands,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllBrands,
  };
}

export function useBrandById(id: number) {
  const { brand, isFinding, error, fetchBrand } = useBrandStore();

  useEffect(() => {
    fetchBrand(id);
  }, [id]);

  return {
    data: brand,
    isFinding,
    error,
    refetch: () => fetchBrand(id),
  };
}
