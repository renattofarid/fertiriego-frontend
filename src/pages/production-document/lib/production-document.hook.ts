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

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    fetchDocuments(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, fetchDocuments]);

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
