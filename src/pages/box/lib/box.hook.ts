import { useEffect } from "react";
import { useBoxStore } from "./box.store";

export function useBox(params?: Record<string, unknown>) {
  const { boxes, meta, isLoading, error, fetchBoxes } =
    useBoxStore();

  useEffect(() => {
    if (!boxes) fetchBoxes(params);
  }, [boxes, fetchBoxes]);

  return {
    data: boxes,
    meta,
    isLoading,
    error,
    refetch: fetchBoxes,
  };
}

export function useAllBoxes() {
  const { allBoxes, isLoadingAll, error, fetchAllBoxes } =
    useBoxStore();

  useEffect(() => {
    if (!allBoxes) fetchAllBoxes();
  }, [allBoxes, fetchAllBoxes]);

  return {
    data: allBoxes,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllBoxes,
  };
}

export function useBoxById(id: number) {
  const { box, isFinding, error, fetchBox } = useBoxStore();

  useEffect(() => {
    fetchBox(id);
  }, [id]);

  return {
    data: box,
    isFinding,
    error,
    refetch: () => fetchBox(id),
  };
}