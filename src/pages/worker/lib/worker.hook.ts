import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { WORKER, WORKER_ROLE_CODE } from "./worker.interface";
import { useQuery } from "@tanstack/react-query";
import { getPersons } from "@/pages/person/lib/person.actions";

export function useWorkers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [WORKER.QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          ...params,
          role_names: [WORKER_ROLE_CODE],
        },
      }),
  });
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
