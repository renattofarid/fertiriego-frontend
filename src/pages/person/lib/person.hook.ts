import { useEffect } from "react";
import { usePersonStore } from "./person.store";

export function usePersons(params?: Record<string, unknown>) {
  const { persons, meta, isLoading, error, fetchPersons } = usePersonStore();

  useEffect(() => {
    if (!persons) fetchPersons({ params });
  }, [persons, fetchPersons]);

  return {
    data: persons,
    meta,
    isLoading,
    error,
    refetch: fetchPersons,
  };
}

export function useAllPersons() {
  const { allPersons, fetchAllPersons } = usePersonStore();

  useEffect(() => {
    if (!allPersons) {
      fetchAllPersons();
    }
  }, [allPersons, fetchAllPersons]);

  return allPersons;
}

export function usePersonById(id: number) {
  const { person, isFinding, error, fetchPersonById } = usePersonStore();

  useEffect(() => {
    if (id) {
      fetchPersonById(id);
    }
  }, [id, fetchPersonById]);

  return {
    data: person,
    isFinding,
    error,
    refetch: () => fetchPersonById(id),
  };
}

export function usePersonRoles(personId: number) {
  const { personRoles, isLoadingRoles, error, fetchPersonRoles } =
    usePersonStore();

  useEffect(() => {
    if (personId) {
      fetchPersonRoles(personId);
    }
  }, [personId, fetchPersonRoles]);

  return {
    data: personRoles,
    isLoading: isLoadingRoles,
    error,
    refetch: () => fetchPersonRoles(personId),
  };
}

export function usePersonRoleDetails(personId: number) {
  const {
    personRoleDetails,
    isLoadingRoleDetails,
    error,
    fetchPersonRoleDetails,
  } = usePersonStore();

  useEffect(() => {
    if (personId) {
      fetchPersonRoleDetails(personId);
    }
  }, [personId, fetchPersonRoleDetails]);

  return {
    data: personRoleDetails,
    isLoading: isLoadingRoleDetails,
    error,
    refetch: () => fetchPersonRoleDetails(personId),
  };
}
