import { api } from "@/lib/config";
import type {
  TraceabilityResponse,
  TraceabilityEntityType,
} from "./traceability.interface";
import { TRACEABILITY_ENDPOINT } from "./traceability.interface";

// ============================================
// TRACEABILITY - Actions
// ============================================

export const getTraceability = async (
  entityType: TraceabilityEntityType,
  entityId: number
): Promise<TraceabilityResponse> => {
  const response = await api.get<TraceabilityResponse>(
    `${TRACEABILITY_ENDPOINT}/${entityType}/${entityId}`
  );
  return response.data;
};
