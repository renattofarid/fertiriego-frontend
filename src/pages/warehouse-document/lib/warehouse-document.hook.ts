import { useEffect } from "react";
import { useWarehouseDocumentStore } from "./warehouse-document.store";
import { WAREHOUSE_DOCUMENT } from "./warehouse-document.interface";
import { getWarehouseDocuments } from "./warehouse-document.actions";
import { useQuery } from "@tanstack/react-query";

const { QUERY_KEY } = WAREHOUSE_DOCUMENT;

export function useWarehouseDocuments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWarehouseDocuments({ params }),
  });
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
