import { useEffect } from "react";
import { useProductionDocumentStore } from "./production-document.store";
import type { GetProductionDocumentsParams } from "./production-document.interface";

export function useProductionDocuments(params?: GetProductionDocumentsParams) {
  const {
    documents,
    meta,
    isLoading,
    error,
    fetchDocuments,
  } = useProductionDocumentStore();

  const page = params?.page;
  const per_page = params?.per_page;

  useEffect(() => {
    fetchDocuments(params);
    // Solo reagendar cuando cambian primitivos relevantes
  }, [page, per_page, fetchDocuments]);

  return {
    data: documents,
    meta,
    isLoading,
    error,
    refetch: fetchDocuments,
  };
}

export function useAllProductionDocuments() {
  const {
    allDocuments,
    isLoadingAll,
    error,
    fetchAllDocuments,
  } = useProductionDocumentStore();

  useEffect(() => {
    if (!allDocuments) {
      fetchAllDocuments();
    }
  }, [allDocuments, fetchAllDocuments]);

  return {
    data: allDocuments,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllDocuments,
  };
}

export function useProductionDocumentById(id: number) {
  const {
    document,
    isFinding,
    error,
    fetchDocument,
  } = useProductionDocumentStore();

  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id, fetchDocument]);

  return {
    data: document,
    isFinding,
    error,
    refetch: () => fetchDocument(id),
  };
}
