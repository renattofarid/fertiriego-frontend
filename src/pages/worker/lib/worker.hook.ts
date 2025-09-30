import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { WORKER_ROLE_CODE, WORKER_ROLE_ID } from "./worker.interface";

export function useWorkers(params?: Record<string, any>) {
  const { persons, meta, isLoading, error, fetchPersons } = usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for workers
      const workerParams = {
        ...params,
        role_names: WORKER_ROLE_CODE,
      };
      fetchPersons({ params: workerParams });
    }
  }, [persons, fetchPersons]);

  // Filter persons that have the WORKER role
  const workerPersons =
    persons?.filter(
      (person) =>
        // Check if person has WORKER role as primary role
        person.rol_id === WORKER_ROLE_ID
    ) || [];

  return {
    data: workerPersons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, any>) => {
      const workerParams = {
        ...refetchParams,
        role_names: WORKER_ROLE_CODE,
      };
      return fetchPersons({ params: workerParams });
    },
  };
}
