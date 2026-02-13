import { create } from "zustand";
import type {
  ProductionDocumentResource,
  CreateProductionDocumentRequest,
  UpdateProductionDocumentRequest,
  GetProductionDocumentsParams,
} from "./production-document.interface";
import {
  getProductionDocuments,
  getAllProductionDocuments,
  findProductionDocumentById,
  storeProductionDocument,
  updateProductionDocument,
  cancelProductionDocument,
  deleteProductionDocument,
} from "./production-document.actions";
import type { ProductionDocumentSchema } from "./production-document.schema";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { PRODUCTION_DOCUMENT } from "./production-document.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = PRODUCTION_DOCUMENT;

interface ProductionDocumentStore {
  // State
  allDocuments: ProductionDocumentResource[] | null;
  documents: ProductionDocumentResource[] | null;
  document: ProductionDocumentResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchAllDocuments: () => Promise<void>;
  fetchDocuments: (params?: GetProductionDocumentsParams) => Promise<void>;
  fetchDocument: (id: number) => Promise<void>;
  createDocument: (data: ProductionDocumentSchema) => Promise<void>;
  updateDocument: (
    id: number,
    data: Partial<ProductionDocumentSchema>
  ) => Promise<void>;
  cancelDocument: (id: number) => Promise<void>;
  removeDocument: (id: number) => Promise<void>;
  resetDocument: () => void;
}

export const useProductionDocumentStore = create<ProductionDocumentStore>(
  (set) => ({
    // Initial state
    allDocuments: null,
    documents: null,
    document: null,
    meta: null,
    isLoadingAll: false,
    isLoading: false,
    isFinding: false,
    isSubmitting: false,
    error: null,

    // Fetch all documents (no pagination)
    fetchAllDocuments: async () => {
      set({ isLoadingAll: true, error: null });
      try {
        const data = await getAllProductionDocuments();
        set({ allDocuments: data, isLoadingAll: false });
      } catch (error) {
        set({
          error: "Error al cargar los documentos de producción",
          isLoadingAll: false,
        });
        errorToast("Error al cargar los documentos de producción");
      }
    },

    // Fetch documents with pagination
    fetchDocuments: async (params?: GetProductionDocumentsParams) => {
      set({ isLoading: true, error: null });
      try {
        const response = await getProductionDocuments(params);
        set({ documents: response.data.data, meta: response.data.meta, isLoading: false });
      } catch (error) {
        set({
          error: "Error al cargar los documentos de producción",
          isLoading: false,
        });
        errorToast("Error al cargar los documentos de producción");
      }
    },

    // Fetch single document by ID
    fetchDocument: async (id: number) => {
      set({ isFinding: true, error: null });
      try {
        const response = await findProductionDocumentById(id);
        set({ document: response.data.data, isFinding: false });
      } catch (error) {
        set({
          error: "Error al cargar el documento de producción",
          isFinding: false,
        });
        errorToast("Error al cargar el documento de producción");
      }
    },

    // Create new document
    createDocument: async (data: ProductionDocumentSchema) => {
      set({ isSubmitting: true, error: null });
      try {
        const request: CreateProductionDocumentRequest = {
          warehouse_origin_id: Number(data.warehouse_origin_id),
          warehouse_dest_id: Number(data.warehouse_dest_id),
          product_id: Number(data.product_id),
          user_id: Number(data.user_id),
          responsible_id: Number(data.responsible_id),
          production_date: data.production_date,
          quantity_produced: Number(data.quantity_produced),
          labor_cost: Number(data.labor_cost),
          overhead_cost: Number(data.overhead_cost),
          observations: data.observations || "",
          components: data.components.map((component) => ({
            component_id: Number(component.component_id),
            quantity_required: Number(component.quantity_required),
            quantity_used: Number(component.quantity_used),
            unit_cost: Number(component.unit_cost),
            notes: component.notes || "",
          })),
        };

        await storeProductionDocument(request);
        set({ isSubmitting: false });
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
        throw error;
      }
    },

    // Update document
    updateDocument: async (
      id: number,
      data: Partial<ProductionDocumentSchema>
    ) => {
      set({ isSubmitting: true, error: null });
      try {
        const request: UpdateProductionDocumentRequest = {
          ...(data.warehouse_origin_id && {
            warehouse_origin_id: Number(data.warehouse_origin_id),
          }),
          ...(data.warehouse_dest_id && {
            warehouse_dest_id: Number(data.warehouse_dest_id),
          }),
          ...(data.product_id && { product_id: Number(data.product_id) }),
          ...(data.user_id && { user_id: Number(data.user_id) }),
          ...(data.responsible_id && {
            responsible_id: Number(data.responsible_id),
          }),
          ...(data.production_date && { production_date: data.production_date }),
          ...(data.quantity_produced && {
            quantity_produced: Number(data.quantity_produced),
          }),
          ...(data.labor_cost && { labor_cost: Number(data.labor_cost) }),
          ...(data.overhead_cost && {
            overhead_cost: Number(data.overhead_cost),
          }),
          ...(data.observations !== undefined && {
            observations: data.observations || "",
          }),
          ...(data.components && {
            components: data.components.map((component) => ({
              component_id: Number(component.component_id),
              quantity_required: Number(component.quantity_required),
              quantity_used: Number(component.quantity_used),
              unit_cost: Number(component.unit_cost),
              notes: component.notes || "",
            })),
          }),
        };

        await updateProductionDocument(id, request);
        set({ isSubmitting: false });
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
        throw error;
      }
    },

    // Cancel document
    cancelDocument: async (id: number) => {
      set({ isSubmitting: true, error: null });
      try {
        await cancelProductionDocument(id);
        set({ isSubmitting: false });
      } catch (error) {
        set({
          error: "Error al cancelar el documento de producción",
          isSubmitting: false,
        });
        throw error;
      }
    },

    // Delete document
    removeDocument: async (id: number) => {
      set({ isSubmitting: true, error: null });
      try {
        await deleteProductionDocument(id);
        set({ isSubmitting: false });
      } catch (error) {
        set({
          error: ERROR_MESSAGE(MODEL, "delete"),
          isSubmitting: false,
        });
        throw error;
      }
    },

    // Reset document state
    resetDocument: () => {
      set({ document: null, error: null });
    },
  })
);
