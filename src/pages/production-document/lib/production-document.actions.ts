import { api } from "@/lib/config";
import type {
  ProductionDocumentResource,
  ProductionDocumentResourceById,
  ProductionDocumentResponse,
  CreateProductionDocumentRequest,
  UpdateProductionDocumentRequest,
  GetProductionDocumentsParams,
} from "./production-document.interface";
import {
  PRODUCTION_DOCUMENT_ENDPOINT,
} from "./production-document.interface";

export async function getProductionDocuments(
  params?: GetProductionDocumentsParams
) {
  const { page = 1, per_page = 15, ...queryParams } = params || {};
  const response = await api.get<ProductionDocumentResponse>(
    `${PRODUCTION_DOCUMENT_ENDPOINT}?page=${page}&per_page=${per_page}`,
    { params: queryParams }
  );
  return response;
}

export async function getAllProductionDocuments(): Promise<ProductionDocumentResource[]> {
  const response = await api.get<ProductionDocumentResponse>(
    `${PRODUCTION_DOCUMENT_ENDPOINT}/all`
  );
  return response.data.data;
}

export async function findProductionDocumentById(id: number) {
  const response = await api.get<ProductionDocumentResourceById>(
    `${PRODUCTION_DOCUMENT_ENDPOINT}/${id}`
  );
  return response;
}

export async function storeProductionDocument(data: CreateProductionDocumentRequest) {
  const response = await api.post<ProductionDocumentResourceById>(
    PRODUCTION_DOCUMENT_ENDPOINT,
    data
  );
  return response;
}

export async function updateProductionDocument(
  id: number,
  data: UpdateProductionDocumentRequest
) {
  const response = await api.put<ProductionDocumentResourceById>(
    `${PRODUCTION_DOCUMENT_ENDPOINT}/${id}`,
    data
  );
  return response;
}

export async function cancelProductionDocument(id: number) {
  const response = await api.post<ProductionDocumentResourceById>(
    `${PRODUCTION_DOCUMENT_ENDPOINT}/${id}/cancel`
  );
  return response;
}

export async function deleteProductionDocument(id: number) {
  const response = await api.delete(
    `${PRODUCTION_DOCUMENT_ENDPOINT}/${id}`
  );
  return response;
}
