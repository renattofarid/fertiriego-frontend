import { useEffect } from "react";
import { useBoxMovementStore } from "./box-movement.store";

export function useBoxMovement(params?: Record<string, unknown>) {
  const { boxMovements, meta, isLoading, error, fetchBoxMovements } = useBoxMovementStore();

  useEffect(() => {
    fetchBoxMovements(params);
  }, []);

  return {
    data: boxMovements,
    meta,
    isLoading,
    error,
    refetch: fetchBoxMovements,
  };
}

export function useBoxMovementById(id: number) {
  const { boxMovement, isFinding, error, fetchBoxMovement } = useBoxMovementStore();

  useEffect(() => {
    if (id) {
      fetchBoxMovement(id);
    }
  }, [id]);

  return {
    data: boxMovement,
    isFinding,
    error,
    refetch: () => fetchBoxMovement(id),
  };
}
