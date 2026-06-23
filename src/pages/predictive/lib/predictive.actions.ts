import { api } from "@/lib/config";
import { PREDICTIVE_ENDPOINT } from "./predictive.interface";
import type {
  AlertsFilters,
  AlertsResponse,
  ReplenishmentRequest,
  ReplenishmentResponse,
  MetricsResponse,
  PredictiveConfigRequest,
  PredictiveConfigResponse,
} from "./predictive.interface";

export async function getPredictiveAlerts(
  filters?: AlertsFilters
): Promise<AlertsResponse> {
  const params: Record<string, any> = {};
  if (filters?.product_id) params.product_id = filters.product_id;
  if (filters?.supplier_id) params.supplier_id = filters.supplier_id;
  if (filters?.urgency) params.urgency = filters.urgency;
  if (filters?.warehouse_id) params.warehouse_id = filters.warehouse_id;

  const { data } = await api.get<AlertsResponse>(
    `${PREDICTIVE_ENDPOINT}/alerts`,
    { params }
  );
  return data;
}

export async function calculateReplenishment(
  payload: ReplenishmentRequest
): Promise<ReplenishmentResponse> {
  const body: Record<string, any> = {};
  if (payload.product_id) body.product_id = payload.product_id;
  if (payload.warehouse_id) body.warehouse_id = payload.warehouse_id;

  const { data } = await api.post<ReplenishmentResponse>(
    `${PREDICTIVE_ENDPOINT}/calculate-replenishment`,
    body
  );
  return data;
}

export async function getProductMetrics(id: number): Promise<MetricsResponse> {
  const { data } = await api.get<MetricsResponse>(
    `${PREDICTIVE_ENDPOINT}/${id}/metrics`
  );
  return data;
}

export async function updatePredictiveConfig(
  payload: PredictiveConfigRequest
): Promise<PredictiveConfigResponse> {
  const { data } = await api.put<PredictiveConfigResponse>(
    `${PREDICTIVE_ENDPOINT}/configurations`,
    payload
  );
  return data;
}
