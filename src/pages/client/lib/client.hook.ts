import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { CLIENT_ROLE_ID } from "./client.interface";

export function useClients(params?: Record<string, any>) {
  const { persons, meta, isLoading, error, fetchPersons } =
    usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for clients
      const clientParams = {
        ...params,
        role_id: CLIENT_ROLE_ID,
      };
      fetchPersons(clientParams);
    }
  }, [persons, fetchPersons]);

  // Filter persons that have the CLIENT role
  const clientPersons = persons?.filter(person =>
    // Check if person has CLIENT role as primary role or in their roles
    person.rol_id === CLIENT_ROLE_ID
  ) || [];

  return {
    data: clientPersons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, any>) => {
      const clientParams = {
        ...refetchParams,
        role_id: CLIENT_ROLE_ID,
      };
      return fetchPersons(clientParams);
    },
  };
}