import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { DRIVER_ROLE_CODE } from "./driver.interface";

export function useDrivers(params?: Record<string, unknown>) {
  const { persons, meta, isLoading, error, fetchPersons } = usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for drivers
      const driverParams = {
        ...params,
        role_names: [DRIVER_ROLE_CODE],
      };
      fetchPersons({ params: driverParams });
    }
  }, [persons, fetchPersons]);

  return {
    data: persons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      const driverParams = {
        ...refetchParams,
        role_names: [DRIVER_ROLE_CODE],
      };
      return fetchPersons({ params: driverParams });
    },
  };
}

export function useAllDrivers(params?: Record<string, unknown>) {
  const { allPersons, fetchAllPersons } = usePersonStore();
  useEffect(() => {
    if (!allPersons) {
      const driverParams = {
        ...params,
        role_names: [DRIVER_ROLE_CODE],
      };
      fetchAllPersons({ params: driverParams });
    }
  }, [allPersons, fetchAllPersons]);
  return allPersons;
}
