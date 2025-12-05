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

// Flow Traceability Interfaces
export interface TraceabilityCustomer {
  id: number;
  name: string;
  document: string;
}

export interface TraceabilityWarehouse {
  id: number;
  name: string;
}

export interface TraceabilityUser {
  id: number;
  name: string;
}

export interface TraceabilityProduct {
  product_id: number;
  product_name: string;
  quantity: string;
  unit_price: string;
  purchase_price?: string;
  subtotal: string;
  tax: string;
  total: string;
  profit?: number;
}

export interface TraceabilityPaymentMethods {
  cash: string;
  card: string;
  yape: string;
  plin: string;
  deposit: string;
  transfer: string;
  other: string;
}

export interface TraceabilityStep {
  step_type: "QUOTATION" | "ORDER" | "SALE";
  step_number: number;
  document_type?: string;
  document_number: string;
  date: string;
  customer: TraceabilityCustomer;
  warehouse: TraceabilityWarehouse;
  user: TraceabilityUser;
  payment_type?: string;
  currency: string;
  status: string;
  products: TraceabilityProduct[];
  total_amount: string | number;
  payment_methods?: TraceabilityPaymentMethods;
}

export interface TraceabilityFlowData {
  flow_type: "DIRECT_SALE" | "FROM_QUOTATION" | "FROM_ORDER";
  flow_description?: string;
  quotation_number?: string;
  order_number?: string;
  has_quotation?: boolean;
  total_orders?: number;
  total_sales?: number;
  steps: TraceabilityStep[];
  summary?: {
    comparison: any[];
  };
}

export interface TraceabilityResponse {
  success: boolean;
  data: TraceabilityFlowData;
}

export type TraceabilityEntityType = "sale" | "quotation" | "order";

export const TRACEABILITY_ENDPOINT = "/traceability";
