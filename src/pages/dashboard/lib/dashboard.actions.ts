import { api } from "@/lib/config";
import { DASHBOARD_ENDPOINT } from "./dashboard.interface";
import type {
  DashboardFilters,
  DashboardSummaryResponse,
  DashboardSuggestionsResponse,
  InventoryStatusResponse,
} from "./dashboard.interface";

function buildParams(filters?: DashboardFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.urgency) params.urgency = filters.urgency;
  if (filters?.warehouse_id) params.warehouse_id = filters.warehouse_id;
  return params;
}

export async function getDashboardSummary(
  filters?: DashboardFilters
): Promise<DashboardSummaryResponse> {
  const { data } = await api.get<DashboardSummaryResponse>(
    `${DASHBOARD_ENDPOINT}/summary`,
    { params: buildParams(filters) }
  );
  return data;
}

export async function getDashboardSuggestions(
  filters?: DashboardFilters
): Promise<DashboardSuggestionsResponse> {
  const { data } = await api.get<DashboardSuggestionsResponse>(
    `${DASHBOARD_ENDPOINT}/suggestions`,
    { params: buildParams(filters) }
  );
  return data;
}

export async function getDashboardInventoryStatus(
  filters?: DashboardFilters
): Promise<InventoryStatusResponse> {
  const { data } = await api.get<InventoryStatusResponse>(
    `${DASHBOARD_ENDPOINT}/inventory-status`,
    { params: buildParams(filters) }
  );
  return data;
}
