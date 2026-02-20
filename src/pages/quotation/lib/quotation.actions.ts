import { api } from "@/lib/config";
import type {
  QuotationResponse,
  QuotationResource,
  QuotationResourceById,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  ProductSalesHistoryResponse,
  ProductPurchaseHistoryResponse,
} from "./quotation.interface";
import { QUOTATION_ENDPOINT } from "./quotation.interface";

// ============================================
// QUOTATION - Main CRUD Actions
// ============================================

export interface GetQuotationsParams {
  params?: Record<any, unknown>;
}

export const getQuotations = async (
  params?: GetQuotationsParams,
): Promise<QuotationResponse> => {
  const response = await api.get<QuotationResponse>(QUOTATION_ENDPOINT, {
    params,
  });
  return response.data;
};

export const getAllQuotations = async (): Promise<QuotationResource[]> => {
  const response = await api.get<QuotationResource[]>(QUOTATION_ENDPOINT, {
    params: { all: true },
  });
  return response.data;
};

export const findQuotationById = async (
  id: number,
): Promise<QuotationResourceById> => {
  const response = await api.get<QuotationResourceById>(
    `${QUOTATION_ENDPOINT}/${id}`,
  );
  return response.data;
};

export const storeQuotation = async (
  data: CreateQuotationRequest,
): Promise<{ message: string; data: QuotationResource }> => {
  const response = await api.post<{
    message: string;
    data: QuotationResource;
  }>(QUOTATION_ENDPOINT, data);
  return response.data;
};

export const updateQuotation = async (
  id: number,
  data: UpdateQuotationRequest,
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${QUOTATION_ENDPOINT}/${id}`,
    data,
  );
  return response.data;
};

export const deleteQuotation = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${QUOTATION_ENDPOINT}/${id}`,
  );
  return response.data;
};

// ============================================
// PRODUCT SALES HISTORY
// ============================================

export interface GetProductSalesHistoryParams {
  productId: number;
  page?: number;
  per_page?: number;
  customer_id?: number;
}

export const getProductSalesHistory = async ({
  productId,
  page = 1,
  per_page = 15,
  customer_id,
}: GetProductSalesHistoryParams): Promise<ProductSalesHistoryResponse> => {
  const response = await api.get<ProductSalesHistoryResponse>(
    `/products/${productId}/sales-history`,
    {
      params: {
        page,
        per_page,
        ...(customer_id && { customer_id }),
      },
    },
  );
  return response.data;
};

export const getProductPurchaseHistory = async ({
  productId,
  page = 1,
  per_page = 15,
}: GetProductSalesHistoryParams): Promise<ProductPurchaseHistoryResponse> => {
  const response = await api.get<ProductPurchaseHistoryResponse>(
    `/products/${productId}/purchase-history`,
    {
      params: { page, per_page },
    },
  );
  return response.data;
};
