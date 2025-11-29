import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { WORKER_ROLE_CODE } from "./worker.interface";

export function useWorkers(params?: Record<string, unknown>) {
  const { persons, meta, isLoading, error, fetchPersons } = usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for workers
      const workerParams = {
        ...params,
        role_names: [WORKER_ROLE_CODE],
      };
      fetchPersons({ params: workerParams });
    }
  }, [persons, fetchPersons]);

  return {
    data: persons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      const workerParams = {
        ...refetchParams,
        role_names: [WORKER_ROLE_CODE],
      };
      return fetchPersons({ params: workerParams });
    },
  };
}

export function useAllWorkers(params?: Record<string, unknown>) {
  const { allPersons, fetchAllPersons } = usePersonStore();
  useEffect(() => {
    if (!allPersons) {
      const workerParams = {
        ...params,
        role_names: [WORKER_ROLE_CODE],
      };
      fetchAllPersons({ params: workerParams });
    }
  }, [allPersons, fetchAllPersons]);
  return allPersons;
}
