import { api } from "@/lib/config";
import type {
  PurchaseResponse,
  PurchaseResource,
  PurchaseResourceById,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseDetailResponse,
  PurchaseDetailResource,
  PurchaseDetailResourceById,
  CreatePurchaseDetailRequestFull,
  UpdatePurchaseDetailRequest,
  PurchaseInstallmentResponse,
  PurchaseInstallmentResource,
  PurchaseInstallmentResourceById,
  CreatePurchaseInstallmentRequestFull,
  UpdatePurchaseInstallmentRequest,
  PurchasePaymentResponse,
  PurchasePaymentResource,
  PurchasePaymentResourceById,
  CreatePurchasePaymentRequest,
  UpdatePurchasePaymentRequest,
} from "./purchase.interface";
import {
  PURCHASE_ENDPOINT,
  PURCHASE_DETAIL_ENDPOINT,
  PURCHASE_INSTALLMENT_ENDPOINT,
  PURCHASE_PAYMENT_ENDPOINT,
} from "./purchase.interface";

// ============================================
// PURCHASE - Main CRUD Actions
// ============================================

export interface GetPurchasesParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  payment_type?: string;
  document_type?: string;
  supplier_id?: number;
  warehouse_id?: number;
  date_from?: string;
  date_to?: string;
}

export const getPurchases = async (
  params?: GetPurchasesParams
): Promise<PurchaseResponse> => {
  const response = await api.get<PurchaseResponse>(PURCHASE_ENDPOINT, {
    params,
  });
  return response.data;
};

export const getAllPurchases = async (): Promise<PurchaseResource[]> => {
  const response = await api.get<PurchaseResource[]>(PURCHASE_ENDPOINT, {
    params: { all: true },
  });
  return response.data;
};

export const findPurchaseById = async (
  id: number
): Promise<PurchaseResourceById> => {
  const response = await api.get<PurchaseResourceById>(
    `${PURCHASE_ENDPOINT}/${id}`
  );
  return response.data;
};

export const storePurchase = async (
  data: CreatePurchaseRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(PURCHASE_ENDPOINT, data);
  return response.data;
};

export const updatePurchase = async (
  id: number,
  data: UpdatePurchaseRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${PURCHASE_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

export const deletePurchase = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${PURCHASE_ENDPOINT}/${id}`
  );
  return response.data;
};

// ============================================
// PURCHASE DETAIL - CRUD Actions
// ============================================

export interface GetPurchaseDetailsParams {
  page?: number;
  per_page?: number;
  purchase_id?: number;
}

export const getPurchaseDetails = async (
  purchaseId: number,
  params?: GetPurchaseDetailsParams
): Promise<PurchaseDetailResponse> => {
  const response = await api.get<PurchaseDetailResponse>(
    PURCHASE_DETAIL_ENDPOINT,
    {
      params: { ...params, purchase_id: purchaseId },
    }
  );
  return response.data;
};

export const getAllPurchaseDetails = async (
  purchaseId: number
): Promise<PurchaseDetailResource[]> => {
  const response = await api.get<PurchaseDetailResource[]>(
    PURCHASE_DETAIL_ENDPOINT,
    {
      params: { purchase_id: purchaseId, all: true },
    }
  );
  return response.data;
};

export const getPurchaseDetailById = async (
  id: number
): Promise<PurchaseDetailResourceById> => {
  const response = await api.get<PurchaseDetailResourceById>(
    `${PURCHASE_DETAIL_ENDPOINT}/${id}`
  );
  return response.data;
};

export const createPurchaseDetail = async (
  data: CreatePurchaseDetailRequestFull
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    PURCHASE_DETAIL_ENDPOINT,
    data
  );
  return response.data;
};

export const updatePurchaseDetail = async (
  id: number,
  data: UpdatePurchaseDetailRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${PURCHASE_DETAIL_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

export const deletePurchaseDetail = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${PURCHASE_DETAIL_ENDPOINT}/${id}`
  );
  return response.data;
};

// ============================================
// PURCHASE INSTALLMENT - CRU Actions (No Delete)
// ============================================

export interface GetPurchaseInstallmentsParams {
  page?: number;
  per_page?: number;
  purchase_id?: number;
}

export const getPurchaseInstallments = async (
  purchaseId: number,
  params?: GetPurchaseInstallmentsParams
): Promise<PurchaseInstallmentResponse> => {
  const response = await api.get<PurchaseInstallmentResponse>(
    PURCHASE_INSTALLMENT_ENDPOINT,
    {
      params: { ...params, purchase_id: purchaseId },
    }
  );
  return response.data;
};

export const getAllPurchaseInstallments = async (
  purchaseId: number
): Promise<PurchaseInstallmentResource[]> => {
  const response = await api.get<PurchaseInstallmentResource[]>(
    PURCHASE_INSTALLMENT_ENDPOINT,
    {
      params: { purchase_id: purchaseId, all: true },
    }
  );
  return response.data;
};

export const getPurchaseInstallmentById = async (
  id: number
): Promise<PurchaseInstallmentResourceById> => {
  const response = await api.get<PurchaseInstallmentResourceById>(
    `${PURCHASE_INSTALLMENT_ENDPOINT}/${id}`
  );
  return response.data;
};

export const createPurchaseInstallment = async (
  data: CreatePurchaseInstallmentRequestFull
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    PURCHASE_INSTALLMENT_ENDPOINT,
    data
  );
  return response.data;
};

export const updatePurchaseInstallment = async (
  id: number,
  data: UpdatePurchaseInstallmentRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${PURCHASE_INSTALLMENT_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

// Note: No delete function for installments as per requirements

// ============================================
// PURCHASE PAYMENT - CRUD Actions
// ============================================

export interface GetPurchasePaymentsParams {
  page?: number;
  per_page?: number;
  purchase_installment_id?: number;
}

export const getPurchasePayments = async (
  installmentId: number,
  params?: GetPurchasePaymentsParams
): Promise<PurchasePaymentResponse> => {
  const response = await api.get<PurchasePaymentResponse>(
    PURCHASE_PAYMENT_ENDPOINT,
    {
      params: { ...params, purchase_installment_id: installmentId },
    }
  );
  return response.data;
};

export const getAllPurchasePayments = async (
  installmentId: number
): Promise<PurchasePaymentResource[]> => {
  const response = await api.get<PurchasePaymentResource[]>(
    PURCHASE_PAYMENT_ENDPOINT,
    {
      params: { purchase_installment_id: installmentId, all: true },
    }
  );
  return response.data;
};

export const getPurchasePaymentById = async (
  id: number
): Promise<PurchasePaymentResourceById> => {
  const response = await api.get<PurchasePaymentResourceById>(
    `${PURCHASE_PAYMENT_ENDPOINT}/${id}`
  );
  return response.data;
};

export const createPurchasePayment = async (
  data: CreatePurchasePaymentRequest | FormData
): Promise<{ message: string }> => {
  const config =
    data instanceof FormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : undefined;

  const response = await api.post<{ message: string }>(
    PURCHASE_PAYMENT_ENDPOINT,
    data,
    config
  );
  return response.data;
};

export const updatePurchasePayment = async (
  id: number,
  data: UpdatePurchasePaymentRequest | FormData
): Promise<{ message: string }> => {
  const config =
    data instanceof FormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : undefined;

  const response = await api.put<{ message: string }>(
    `${PURCHASE_PAYMENT_ENDPOINT}/${id}`,
    data,
    config
  );
  return response.data;
};

export const deletePurchasePayment = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${PURCHASE_PAYMENT_ENDPOINT}/${id}`
  );
  return response.data;
};
