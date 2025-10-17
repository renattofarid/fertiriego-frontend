import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { SUPPLIER_ROLE_CODE } from "./supplier.interface";

export function useSuppliers(params?: Record<string, unknown>) {
  const { persons, meta, isLoading, error, fetchPersons } = usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for suppliers
      const supplierParams = {
        ...params,
        role_names: [SUPPLIER_ROLE_CODE],
      };
      fetchPersons({ params: supplierParams });
    }
  }, [persons, fetchPersons]);

  return {
    data: persons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      const supplierParams = {
        ...refetchParams,
        role_names: [SUPPLIER_ROLE_CODE],
      };
      return fetchPersons({ params: supplierParams });
    },
  };
}

export function useAllSuppliers() {
  const { allPersons = [], error, fetchAllPersons } = usePersonStore();

  useEffect(() => {
    if (!allPersons) fetchAllPersons({
      params: {
        role_names: [SUPPLIER_ROLE_CODE]
      }
    });
  }, [allPersons, fetchAllPersons]);

  return {
    data: allPersons,
    isLoading: false,
    error,
    refetch: fetchAllPersons,
  };
}
