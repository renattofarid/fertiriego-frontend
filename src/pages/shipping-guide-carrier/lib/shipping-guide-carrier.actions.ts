import { api } from "@/lib/config";
import type {
  ShippingGuideCarrierResponse,
  ShippingGuideCarrierResource,
  ShippingGuideCarrierResourceById,
  CreateShippingGuideCarrierRequest,
  UpdateShippingGuideCarrierRequest,
} from "./shipping-guide-carrier.interface";
import { SHIPPING_GUIDE_CARRIER_ENDPOINT } from "./shipping-guide-carrier.interface";

// ============================================
// SHIPPING GUIDE CARRIER - Main CRUD Actions
// ============================================

export interface GetShippingGuideCarriersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  carrier_id?: number;
  date_from?: string;
  date_to?: string;
}

export const getShippingGuideCarriers = async (
  params?: GetShippingGuideCarriersParams
): Promise<ShippingGuideCarrierResponse> => {
  const response = await api.get<ShippingGuideCarrierResponse>(
    SHIPPING_GUIDE_CARRIER_ENDPOINT,
    { params }
  );
  return response.data;
};

export const getAllShippingGuideCarriers = async (): Promise<
  ShippingGuideCarrierResource[]
> => {
  const response = await api.get<ShippingGuideCarrierResource[]>(
    SHIPPING_GUIDE_CARRIER_ENDPOINT,
    { params: { all: true } }
  );
  return response.data;
};

export const findShippingGuideCarrierById = async (
  id: number
): Promise<ShippingGuideCarrierResourceById> => {
  const response = await api.get<ShippingGuideCarrierResourceById>(
    `${SHIPPING_GUIDE_CARRIER_ENDPOINT}/${id}`
  );
  return response.data;
};

export const storeShippingGuideCarrier = async (
  data: CreateShippingGuideCarrierRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    SHIPPING_GUIDE_CARRIER_ENDPOINT,
    data
  );
  return response.data;
};

export const updateShippingGuideCarrier = async (
  id: number,
  data: UpdateShippingGuideCarrierRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${SHIPPING_GUIDE_CARRIER_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

export const deleteShippingGuideCarrier = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${SHIPPING_GUIDE_CARRIER_ENDPOINT}/${id}`
  );
  return response.data;
};

export interface ChangeShippingGuideCarrierStatusRequest {
  status: string;
}

export const changeShippingGuideCarrierStatus = async (
  id: number,
  data: ChangeShippingGuideCarrierStatusRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${SHIPPING_GUIDE_CARRIER_ENDPOINT}/${id}/status`,
    data
  );
  return response.data;
};
