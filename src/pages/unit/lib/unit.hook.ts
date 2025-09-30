import { useEffect } from "react";
import { useUnitStore } from "./unit.store";

export function useUnit(params?: Record<string, unknown>) {
  const { units, meta, isLoading, error, fetchUnits } = useUnitStore();

  useEffect(() => {
    if (!units) fetchUnits(params);
  }, [units, fetchUnits]);

  return {
    data: units,
    meta,
    isLoading,
    error,
    refetch: fetchUnits,
  };
}

export function useAllUnits() {
  const { allUnits, isLoadingAll, error, fetchAllUnits } = useUnitStore();

  useEffect(() => {
    if (!allUnits) fetchAllUnits();
  }, [allUnits, fetchAllUnits]);

  return {
    data: allUnits,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllUnits,
  };
}

export function useUnitById(id: number) {
  const { unit, isFinding, error, fetchUnit } = useUnitStore();

  useEffect(() => {
    fetchUnit(id);
  }, [id]);

  return {
    data: unit,
    isFinding,
    error,
    refetch: () => fetchUnit(id),
  };
}