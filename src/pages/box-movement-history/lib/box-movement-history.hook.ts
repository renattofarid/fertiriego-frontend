import { useEffect } from "react";
import { useBoxMovementHistoryStore } from "./box-movement-history.store";

export function useBoxMovementHistory(params?: Record<string, unknown>) {
  const { histories, meta, isLoading, error, fetchHistories } = useBoxMovementHistoryStore();

  useEffect(() => {
    fetchHistories(params);
  }, []);

  return {
    data: histories,
    meta,
    isLoading,
    error,
    refetch: fetchHistories,
  };
}

export function useBoxMovementHistoryByMovement(box_movement_id: number) {
  const { histories, meta, isLoading, error, fetchHistoriesByMovement } = useBoxMovementHistoryStore();

  useEffect(() => {
    if (box_movement_id) {
      fetchHistoriesByMovement(box_movement_id);
    }
  }, [box_movement_id]);

  return {
    data: histories,
    meta,
    isLoading,
    error,
    refetch: () => fetchHistoriesByMovement(box_movement_id),
  };
}
