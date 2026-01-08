import { create } from "zustand";
import type {
  QuotationResource,
  CreateQuotationRequest,
  UpdateQuotationRequest,
} from "./quotation.interface";
import {
  getQuotations,
  getAllQuotations,
  findQuotationById,
  storeQuotation,
  updateQuotation,
  deleteQuotation,
  type GetQuotationsParams,
} from "./quotation.actions";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { QUOTATION } from "./quotation.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = QUOTATION;

interface QuotationStore {
  // State
  allQuotations?: QuotationResource[];
  quotations?: QuotationResource[];
  quotation?: QuotationResource;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  // Actions
  fetchAllQuotations: () => Promise<void>;
  fetchQuotations: (params?: GetQuotationsParams) => Promise<void>;
  fetchQuotation: (id: number) => Promise<void>;
  createQuotation: (data: CreateQuotationRequest) => Promise<QuotationResource>;
  updateQuotation: (id: number, data: UpdateQuotationRequest) => Promise<void>;
  removeQuotation: (id: number) => Promise<void>;
  resetQuotation: () => void;
}

export const useQuotationStore = create<QuotationStore>((set) => ({
  // Initial state
  allQuotations: undefined,
  quotations: undefined,
  quotation: undefined,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  // Fetch all quotations (no pagination)
  fetchAllQuotations: async () => {
    set({ isLoadingAll: true, error: undefined });
    try {
      const data = await getAllQuotations();
      set({ allQuotations: data, isLoadingAll: false });
    } catch (error) {
      set({ error: "Error al cargar las cotizaciones", isLoadingAll: false });
      errorToast("Error al cargar las cotizaciones");
    }
  },

  // Fetch quotations with pagination
  fetchQuotations: async (params?: GetQuotationsParams) => {
    set({ isLoading: true, error: undefined });
    try {
      const response = await getQuotations(params);
      const meta = response.meta;
      set({ quotations: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar las cotizaciones", isLoading: false });
      errorToast("Error al cargar las cotizaciones");
    }
  },

  // Fetch single quotation by ID
  fetchQuotation: async (id: number) => {
    set({ isFinding: true, error: undefined });
    try {
      const response = await findQuotationById(id);
      set({ quotation: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar la cotización", isFinding: false });
      errorToast("Error al cargar la cotización");
    }
  },

  // Create new quotation
  createQuotation: async (data: CreateQuotationRequest) => {
    set({ isSubmitting: true, error: undefined });
    try {
      const response = await storeQuotation(data);
      set({ isSubmitting: false });
      return response.data;
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update quotation
  updateQuotation: async (id: number, data: UpdateQuotationRequest) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await updateQuotation(id, data);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Delete quotation
  removeQuotation: async (id: number) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await deleteQuotation(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
      throw error;
    }
  },

  // Reset quotation state
  resetQuotation: () => {
    set({ quotation: undefined, error: undefined });
  },
}));
