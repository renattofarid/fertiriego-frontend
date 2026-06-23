import { api } from "@/lib/config";
import type {
  GetSuggestedLotsParams,
  SuggestedLot,
  CreateBatchOrderRequest,
  CreateBatchOrderResponse,
} from "./purchase-order-batch.interface";
import type { AxiosRequestConfig } from "axios";

interface ApiSuggestedLotItem {
  product_id: number;
  product_name: string;
  quantity_requested: number;
  unit_price_estimated: number;
  subtotal_estimated: number;
  urgency: string | null;
  suggestion_reason: string | null;
  lead_time_days: number;
}

interface ApiSuggestedLot {
  supplier: { id: number | null; name: string };
  items_count: number;
  total_estimated: number;
  currency: string;
  highest_urgency: string | null;
  items: ApiSuggestedLotItem[];
}

interface ApiSuggestedLotsResponse {
  message: string;
  data: ApiSuggestedLot[];
  total: number;
}

export async function getSuggestedLots(
  params: GetSuggestedLotsParams
): Promise<SuggestedLot[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...(params.supplier_id != null && { supplier_id: params.supplier_id }),
      ...(params.urgency != null && { urgency: params.urgency }),
      ...(params.warehouse_id != null && {
        warehouse_id: params.warehouse_id,
      }),
    },
  };
  const { data } = await api.get<ApiSuggestedLotsResponse>(
    "/purchaseorder/suggested-lots",
    config
  );
  const lots: ApiSuggestedLot[] = Array.isArray(data?.data) ? data.data : [];
  return lots.map((lot, index) => ({
    supplier_id: lot.supplier.id ?? -(index + 1),
    supplier_name: lot.supplier.name,
    items: lot.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity_suggested: item.quantity_requested,
      unit_price_estimated: item.unit_price_estimated,
      urgency: item.urgency,
      suggestion_reason: item.suggestion_reason,
    })),
  }));
}

export async function createBatchOrders(
  request: CreateBatchOrderRequest
): Promise<CreateBatchOrderResponse> {
  const { data } = await api.post<CreateBatchOrderResponse>(
    "/purchaseorder/batch",
    request
  );
  return data;
}
