import { Layers } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

const ROUTE = "/ordenes-compra/lotes";

export const PURCHASE_ORDER_BATCH: Pick<
  ModelComplete<any>,
  "MODEL" | "ICON" | "ICON_REACT" | "ROUTE"
> = {
  MODEL: {
    name: "Compra por Lote",
    description: "Generación masiva de órdenes de compra por lote.",
    plural: "Compras por Lote",
    gender: false,
  },
  ICON: "Layers",
  ICON_REACT: Layers,
  ROUTE,
};

// --- Suggested lots ---

export interface SuggestedLotItem {
  product_id: number;
  product_name: string;
  quantity_suggested: number;
  unit_price_estimated: number;
  urgency: string | null;
  suggestion_reason: string | null;
}

export interface SuggestedLot {
  supplier_id: number;
  supplier_name: string;
  items: SuggestedLotItem[];
}

export interface GetSuggestedLotsParams {
  supplier_id?: number | null;
  urgency?: string | null;
  warehouse_id?: number | null;
}

// --- Batch request ---

export interface BatchOrderItem {
  product_id: number;
  quantity_requested: number;
  unit_price_estimated: number;
  suggestion_reason: string | null;
  urgency_at_creation: string | null;
}

export interface BatchOrderEntry {
  supplier_id: number;
  warehouse_id: number;
  currency: "PEN" | "USD";
  apply_igv: boolean | null;
  payment_type: string | null;
  days: number | null;
  expected_date: string | null;
  observations: string | null;
  items: BatchOrderItem[];
}

export interface CreateBatchOrderRequest {
  orders: BatchOrderEntry[];
}

// --- Batch response ---

export interface BatchOrderDetailResource {
  id: number;
  correlativo: string;
  purchase_order_id: number;
  purchase_order_correlative: string;
  product_id: number;
  product_name: string;
  quantity_requested: number;
  unit_price_estimated: string;
  subtotal_estimated: string;
  created_at: string;
}

export interface BatchOrderResource {
  id: number;
  correlativo: string;
  supplier_id: number;
  apply_igv: boolean;
  supplier_fullname: string;
  warehouse_id: number;
  warehouse_name: string;
  user_id: number;
  user_name: string;
  order_number: string;
  issue_date: string;
  payment_type: string | null;
  days: number | null;
  currency: string;
  expected_date: string | null;
  status: string;
  observations: string | null;
  total_estimated: string;
  purchase_id: number | null;
  purchase_correlativo: string | null;
  details: BatchOrderDetailResource[];
  created_at: string;
}

export interface CreateBatchOrderResponse {
  message: string;
  data: BatchOrderResource[];
}

// Internal UI state per lot group (after selecting from suggestions)
export interface LotOrderConfig {
  supplier_id: number;
  supplier_name: string;
  warehouse_id: string;
  currency: "PEN" | "USD";
  apply_igv: boolean;
  payment_type: string;
  days: string;
  expected_date: string;
  observations: string;
  items: LotOrderItemConfig[];
}

export interface LotOrderItemConfig {
  product_id: number;
  product_name: string;
  quantity_requested: string;
  unit_price_estimated: string;
  suggestion_reason: string | null;
  urgency_at_creation: string | null;
  selected: boolean;
}
