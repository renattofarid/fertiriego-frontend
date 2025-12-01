import { useEffect } from "react";
import { useBoxShiftStore } from "./box-shift.store";

export function useBoxShift(params?: Record<string, unknown>) {
  const { boxShifts, meta, isLoading, error, fetchBoxShifts } = useBoxShiftStore();

  useEffect(() => {
    fetchBoxShifts(params);
  }, []);

  return {
    data: boxShifts,
    meta,
    isLoading,
    error,
    refetch: fetchBoxShifts,
  };
}

export function useBoxShiftById(id: number) {
  const { boxShift, isFinding, error, fetchBoxShift } = useBoxShiftStore();

  useEffect(() => {
    if (id) {
      fetchBoxShift(id);
    }
  }, [id]);

  return {
    data: boxShift,
    isFinding,
    error,
    refetch: () => fetchBoxShift(id),
  };
}
