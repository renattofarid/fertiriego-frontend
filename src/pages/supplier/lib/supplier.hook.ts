import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { SUPPLIER_ROLE_ID } from "./supplier.interface";

export function useSuppliers(params?: Record<string, any>) {
  const { persons, meta, isLoading, error, fetchPersons } =
    usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for suppliers
      const supplierParams = {
        ...params,
        role_id: SUPPLIER_ROLE_ID,
      };
      fetchPersons(supplierParams);
    }
  }, [persons, fetchPersons]);

  // Filter persons that have the SUPPLIER role
  const supplierPersons = persons?.filter(person =>
    // Check if person has SUPPLIER role as primary role
    person.rol_id === SUPPLIER_ROLE_ID
  ) || [];

  return {
    data: supplierPersons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, any>) => {
      const supplierParams = {
        ...refetchParams,
        role_id: SUPPLIER_ROLE_ID,
      };
      return fetchPersons(supplierParams);
    },
  };
}