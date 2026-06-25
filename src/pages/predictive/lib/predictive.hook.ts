import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPredictiveAlerts,
  calculateReplenishment,
  getProductMetrics,
  updatePredictiveConfig,
} from "./predictive.actions";
import type {
  AlertsFilters,
  ReplenishmentRequest,
  PredictiveConfigRequest,
} from "./predictive.interface";
import { errorToast, successToast } from "@/lib/core.function";

const ALERTS_KEY = "predictive-alerts";
const METRICS_KEY = "predictive-metrics";

export function usePredictiveAlerts(filters?: AlertsFilters) {
  return useQuery({
    queryKey: [ALERTS_KEY, filters],
    queryFn: () => getPredictiveAlerts(filters),
    refetchOnWindowFocus: false,
  });
}

export function useProductMetrics(id: number | null) {
  return useQuery({
    queryKey: [METRICS_KEY, id],
    queryFn: () => getProductMetrics(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

export function useCalculateReplenishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReplenishmentRequest) =>
      calculateReplenishment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Error al calcular reabastecimiento";
      errorToast(message);
    },
  });
}

export function useUpdatePredictiveConfig() {
  return useMutation({
    mutationFn: (payload: PredictiveConfigRequest) =>
      updatePredictiveConfig(payload),
    onSuccess: (response) => {
      successToast(response.message);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Error al actualizar la configuración";
      errorToast(message);
    },
  });
}
