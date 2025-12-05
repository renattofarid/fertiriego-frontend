import { create } from "zustand";
import {
  getWarehouseDocuments,
  findWarehouseDocumentById,
  storeWarehouseDocument,
  updateWarehouseDocument,
  confirmWarehouseDocument,
  cancelWarehouseDocument,
  deleteWarehouseDocument,
} from "./warehouse-document.actions";
import type { Meta } from "@/lib/pagination.interface";
import type {
  WarehouseDocumentResource,
  CreateWarehouseDocumentRequest,
  UpdateWarehouseDocumentRequest,
} from "./warehouse-document.interface";

interface WarehouseDocumentStore {
  documents: WarehouseDocumentResource[] | null;
  document: WarehouseDocumentResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;
  fetchDocuments: (params?: Record<string, any>) => Promise<void>;
  fetchDocument: (id: number) => Promise<void>;
  createDocument: (data: CreateWarehouseDocumentRequest) => Promise<void>;
  updateDocument: (
    id: number,
    data: UpdateWarehouseDocumentRequest
  ) => Promise<void>;
  confirmDocument: (id: number) => Promise<void>;
  cancelDocument: (id: number) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

export const useWarehouseDocumentStore = create<WarehouseDocumentStore>(
  (set) => ({
    documents: null,
    document: null,
    meta: undefined,
    isLoading: false,
    isFinding: false,
    isSubmitting: false,
    error: undefined,

    fetchDocuments: async (params?: Record<string, any>) => {
      set({ isLoading: true, error: undefined});
      try {
        const { data, meta } = await getWarehouseDocuments({ params });
        set({ documents: data, meta: meta, isLoading: false });
      } catch (err) {
        set({
          error: "Error al cargar documentos de almacén",
          isLoading: false,
        });
      }
    },

    fetchDocument: async (id: number) => {
      set({ isFinding: true, error: undefined});
      try {
        const { data } = await findWarehouseDocumentById(id);
        set({ document: data, isFinding: false });
      } catch (err) {
        set({ error: "Error al cargar el documento", isFinding: false });
      }
    },

    createDocument: async (data: CreateWarehouseDocumentRequest) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await storeWarehouseDocument(data);
      } catch (err) {
        set({ error: "Error al crear el documento" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateDocument: async (
      id: number,
      data: UpdateWarehouseDocumentRequest
    ) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await updateWarehouseDocument(id, data);
      } catch (err) {
        set({ error: "Error al actualizar el documento" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    confirmDocument: async (id: number) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await confirmWarehouseDocument(id);
      } catch (err) {
        set({ error: "Error al confirmar el documento" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    cancelDocument: async (id: number) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await cancelWarehouseDocument(id);
      } catch (err) {
        set({ error: "Error al cancelar el documento" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    deleteDocument: async (id: number) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await deleteWarehouseDocument(id);
      } catch (err) {
        set({ error: "Error al eliminar el documento" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },
  })
);
