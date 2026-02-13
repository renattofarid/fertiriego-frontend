import { useEffect } from "react";
import { useVehicleStore } from "./vehicle.store";
import { getVehicles } from "./vehicle.actions";
import { useQuery } from "@tanstack/react-query";
import { VEHICLE } from "./vehicle.interface";

export function useVehicles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [VEHICLE.QUERY_KEY, params],
    queryFn: () =>
      getVehicles({
        params: {
          ...params,
        },
      }),
  });
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
