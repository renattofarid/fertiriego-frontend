import { api } from "@/lib/config";
import type {
  PurchaseShippingGuideResponse,
  PurchaseShippingGuideResourceById,
  CreatePurchaseShippingGuideRequest,
  UpdatePurchaseShippingGuideRequest,
  AssignPurchaseRequest,
} from "./purchase-shipping-guide.interface";

const ENDPOINT = "/purchaseshippingguide";

// ===== TYPES =====

export interface GetPurchaseShippingGuidesParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  purchase_id?: number;
}

// ===== GET ALL (NO PAGINATION) =====

export const getAllPurchaseShippingGuides = async () => {
  const response = await api.get<PurchaseShippingGuideResponse>(
    `${ENDPOINT}/all`
  );
  return response.data.data;
};

// ===== GET WITH PAGINATION =====

export const getPurchaseShippingGuides = async (
  params?: GetPurchaseShippingGuidesParams
) => {
  const response = await api.get<PurchaseShippingGuideResponse>(ENDPOINT, {
    params,
  });
  return response.data;
};

// ===== GET BY ID =====

export const findPurchaseShippingGuideById = async (id: number) => {
  const response = await api.get<PurchaseShippingGuideResourceById>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
};

// ===== CREATE =====

export const storePurchaseShippingGuide = async (
  data: CreatePurchaseShippingGuideRequest
) => {
  const response = await api.post(ENDPOINT, data);
  return response.data;
};

// ===== UPDATE =====

export const updatePurchaseShippingGuide = async (
  id: number,
  data: UpdatePurchaseShippingGuideRequest
) => {
  const response = await api.put(`${ENDPOINT}/${id}`, data);
  return response.data;
};

// ===== DELETE =====

export const deletePurchaseShippingGuide = async (id: number) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};

// ===== ASSIGN PURCHASE =====

export const assignPurchase = async (
  id: number,
  data: AssignPurchaseRequest
) => {
  const response = await api.put(
    `purchase-shipping-guides/${id}/assign-purchase`,
    data
  );
  return response.data;
};
