// ============================================
// TRACEABILITY - Interfaces & Types
// ============================================

export interface TraceabilityEvent {
  id: number;
  event_type: string;
  description: string;
  user_id: number;
  user_name: string;
  occurred_at: string;
  metadata?: Record<string, any>;
}

export interface TraceabilityResponse {
  data: TraceabilityEvent[];
  entity_type: string;
  entity_id: number;
}

export type TraceabilityEntityType = "sale" | "quotation" | "order";

export const TRACEABILITY_ENDPOINT = "/traceability";
