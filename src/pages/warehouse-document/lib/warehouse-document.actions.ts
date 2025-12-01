import { api } from "@/lib/config";
import {
  WAREHOUSE_DOCUMENT,
  type GetWarehouseDocumentsProps,
  type WarehouseDocumentResponse,
  type WarehouseDocumentResourceById,
  type CreateWarehouseDocumentRequest,
  type UpdateWarehouseDocumentRequest,
} from "./warehouse-document.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = WAREHOUSE_DOCUMENT;

// Get all warehouse documents with pagination
export async function getWarehouseDocuments({
  params,
}: GetWarehouseDocumentsProps): Promise<WarehouseDocumentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<WarehouseDocumentResponse>(ENDPOINT, config);
  return data;
}

// Find warehouse document by ID
export async function findWarehouseDocumentById(
  id: number
): Promise<WarehouseDocumentResourceById> {
  const response = await api.get<WarehouseDocumentResourceById>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

// Create warehouse document (draft)
export async function storeWarehouseDocument(
  data: CreateWarehouseDocumentRequest
): Promise<{ message: string; data: WarehouseDocumentResourceById }> {
  const response = await api.post<{ message: string; data: WarehouseDocumentResourceById }>(
    ENDPOINT,
    data
  );
  return response.data;
}

// Update warehouse document
export async function updateWarehouseDocument(
  id: number,
  data: UpdateWarehouseDocumentRequest
): Promise<{ message: string }> {
  const response = await api.put<{ message: string }>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

// Confirm warehouse document
export async function confirmWarehouseDocument(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `${ENDPOINT}/${id}/confirm`
  );
  return data;
}

// Cancel warehouse document
export async function cancelWarehouseDocument(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `${ENDPOINT}/${id}/cancel`
  );
  return data;
}

// Delete warehouse document
export async function deleteWarehouseDocument(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}
