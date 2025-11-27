import { useEffect } from "react";
import { useWarehouseDocumentStore } from "./warehouse-document.store";

export function useWarehouseDocuments(params?: Record<string, unknown>) {
  const { documents, meta, isLoading, error, fetchDocuments } =
    useWarehouseDocumentStore();

  useEffect(() => {
    if (!documents) fetchDocuments(params);
  }, [documents, fetchDocuments]);

  return {
    data: documents,
    meta,
    isLoading,
    error,
    refetch: fetchDocuments,
  };
}

export function useWarehouseDocumentById(id: number) {
  const { document, isFinding, error, fetchDocument } =
    useWarehouseDocumentStore();

  useEffect(() => {
    fetchDocument(id);
  }, [id]);

  return {
    data: document,
    isFinding,
    error,
    refetch: () => fetchDocument(id),
  };
}
