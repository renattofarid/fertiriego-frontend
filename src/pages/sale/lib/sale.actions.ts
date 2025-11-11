import { api } from "@/lib/config";
import type {
  SaleResponse,
  SaleResource,
  SaleResourceById,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleDetailResponse,
  SaleDetailResource,
  SaleDetailResourceById,
  CreateSaleDetailRequestFull,
  UpdateSaleDetailRequest,
  SaleInstallmentResponse,
  SaleInstallmentResource,
  SaleInstallmentResourceById,
  CreateSaleInstallmentRequestFull,
  UpdateSaleInstallmentRequest,
  SalePaymentResponse,
  SalePaymentResource,
  SalePaymentResourceById,
  CreateSalePaymentRequest,
  UpdateSalePaymentRequest,
} from "./sale.interface";
import {
  SALE_ENDPOINT,
  SALE_INSTALLMENT_ENDPOINT,
  SALE_PAYMENT_ENDPOINT,
} from "./sale.interface";

// ============================================
// SALE - Main CRUD Actions
// ============================================

export interface GetSalesParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  payment_type?: string;
  document_type?: string;
  customer_id?: number;
  warehouse_id?: number;
  date_from?: string;
  date_to?: string;
}

export const getSales = async (
  params?: GetSalesParams
): Promise<SaleResponse> => {
  const response = await api.get<SaleResponse>(SALE_ENDPOINT, { params });
  return response.data;
};

export const getAllSales = async (): Promise<SaleResource[]> => {
  const response = await api.get<SaleResource[]>(SALE_ENDPOINT, {
    params: { all: true },
  });
  return response.data;
};

export const findSaleById = async (id: number): Promise<SaleResourceById> => {
  const response = await api.get<SaleResourceById>(`${SALE_ENDPOINT}/${id}`);
  return response.data;
};

export const storeSale = async (
  data: CreateSaleRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(SALE_ENDPOINT, data);
  return response.data;
};

export const updateSale = async (
  id: number,
  data: UpdateSaleRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${SALE_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

export const deleteSale = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${SALE_ENDPOINT}/${id}`
  );
  return response.data;
};

// ============================================
// SALE DETAIL - CRUD Actions (Nested in Sale)
// ============================================

export interface GetSaleDetailsParams {
  page?: number;
  per_page?: number;
  sale_id?: number;
}

export const getSaleDetails = async (
  saleId: number,
  params?: GetSaleDetailsParams
): Promise<SaleDetailResponse> => {
  const response = await api.get<SaleDetailResponse>(
    `${SALE_ENDPOINT}/${saleId}/details`,
    {
      params,
    }
  );
  return response.data;
};

export const getAllSaleDetails = async (
  saleId: number
): Promise<SaleDetailResource[]> => {
  const response = await api.get<SaleDetailResource[]>(
    `${SALE_ENDPOINT}/${saleId}/details`,
    {
      params: { all: true },
    }
  );
  return response.data;
};

export const getSaleDetailById = async (
  saleId: number,
  detailId: number
): Promise<SaleDetailResourceById> => {
  const response = await api.get<SaleDetailResourceById>(
    `${SALE_ENDPOINT}/${saleId}/details/${detailId}`
  );
  return response.data;
};

export const createSaleDetail = async (
  saleId: number,
  data: CreateSaleDetailRequestFull
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `${SALE_ENDPOINT}/${saleId}/details`,
    data
  );
  return response.data;
};

export const updateSaleDetail = async (
  saleId: number,
  detailId: number,
  data: UpdateSaleDetailRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${SALE_ENDPOINT}/${saleId}/details/${detailId}`,
    data
  );
  return response.data;
};

export const deleteSaleDetail = async (
  saleId: number,
  detailId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${SALE_ENDPOINT}/${saleId}/details/${detailId}`
  );
  return response.data;
};

// ============================================
// SALE INSTALLMENT - CRUD Actions
// ============================================

export interface GetSaleInstallmentsParams {
  page?: number;
  per_page?: number;
  sale_id?: number;
}

export const getSaleInstallments = async (
  params?: GetSaleInstallmentsParams
): Promise<SaleInstallmentResponse> => {
  const response = await api.get<SaleInstallmentResponse>(
    SALE_INSTALLMENT_ENDPOINT,
    { params }
  );
  return response.data;
};

export const getAllSaleInstallments = async (
  saleId?: number
): Promise<SaleInstallmentResource[]> => {
  const response = await api.get<SaleInstallmentResource[]>(
    SALE_INSTALLMENT_ENDPOINT,
    {
      params: { sale_id: saleId, all: true },
    }
  );
  return response.data;
};

export const getSaleInstallmentById = async (
  id: number
): Promise<SaleInstallmentResourceById> => {
  const response = await api.get<SaleInstallmentResourceById>(
    `${SALE_INSTALLMENT_ENDPOINT}/${id}`
  );
  return response.data;
};

export const createSaleInstallment = async (
  data: CreateSaleInstallmentRequestFull
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    SALE_INSTALLMENT_ENDPOINT,
    data
  );
  return response.data;
};

export const updateSaleInstallment = async (
  id: number,
  data: UpdateSaleInstallmentRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${SALE_INSTALLMENT_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

export const deleteSaleInstallment = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${SALE_INSTALLMENT_ENDPOINT}/${id}`
  );
  return response.data;
};

// ============================================
// SALE PAYMENT - CRUD Actions
// Endpoint: /installment/{installmentId}/payments
// ============================================

export interface GetSalePaymentsParams {
  page?: number;
  per_page?: number;
}

export const getSalePayments = async (
  installmentId: number,
  params?: GetSalePaymentsParams
): Promise<SalePaymentResponse> => {
  const response = await api.get<SalePaymentResponse>(
    `${SALE_PAYMENT_ENDPOINT}/${installmentId}/payments`,
    { params }
  );
  return response.data;
};

export const getAllSalePayments = async (
  installmentId: number
): Promise<SalePaymentResource[]> => {
  const response = await api.get<any>(
    `${SALE_PAYMENT_ENDPOINT}/${installmentId}/payments`,
    { params: { all: true } }
  );
  return response.data.data;
};

export const getSalePaymentById = async (
  installmentId: number,
  paymentId: number
): Promise<SalePaymentResourceById> => {
  const response = await api.get<SalePaymentResourceById>(
    `${SALE_PAYMENT_ENDPOINT}/${installmentId}/payments/${paymentId}`
  );
  return response.data;
};

export const createSalePayment = async (
  installmentId: number,
  data: CreateSalePaymentRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `${SALE_PAYMENT_ENDPOINT}/${installmentId}/payments`,
    data
  );
  return response.data;
};

export const updateSalePayment = async (
  installmentId: number,
  paymentId: number,
  data: UpdateSalePaymentRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${SALE_PAYMENT_ENDPOINT}/${installmentId}/payments/${paymentId}`,
    data
  );
  return response.data;
};

export const deleteSalePayment = async (
  installmentId: number,
  paymentId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${SALE_PAYMENT_ENDPOINT}/${installmentId}/payments/${paymentId}`
  );
  return response.data;
};
