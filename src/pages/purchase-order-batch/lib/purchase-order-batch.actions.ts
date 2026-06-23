import { api } from "@/lib/config";
import type {
  GetSuggestedLotsParams,
  SuggestedLot,
  CreateBatchOrderRequest,
  CreateBatchOrderResponse,
} from "./purchase-order-batch.interface";
import type { AxiosRequestConfig } from "axios";

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
  const { data } = await api.get<SuggestedLot[]>(
    "/purchaseorder/suggested-lots",
    config
  );
  return data;
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
