import { useEffect } from "react";
import { useVehicleStore } from "./vehicle.store";

export function useVehicle(params?: Record<string, unknown>) {
  const { vehicles, meta, isLoading, error, fetchVehicles } = useVehicleStore();

  useEffect(() => {
    if (!vehicles) fetchVehicles(params);
  }, [vehicles, fetchVehicles]);

  return {
    data: vehicles,
    meta,
    isLoading,
    error,
    refetch: fetchVehicles,
  };
}

export function useAllVehicles() {
  const { allVehicles, isLoadingAll, error, fetchAllVehicles } = useVehicleStore();

  useEffect(() => {
    if (!allVehicles) fetchAllVehicles();
  }, [allVehicles, fetchAllVehicles]);

  return {
    data: allVehicles,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllVehicles,
  };
}

export function useVehicleById(id: number) {
  const { vehicle, isFinding, error, fetchVehicle } = useVehicleStore();

  useEffect(() => {
    fetchVehicle(id);
  }, [id]);

  return {
    data: vehicle,
    isFinding,
    error,
    refetch: () => fetchVehicle(id),
  };
}
