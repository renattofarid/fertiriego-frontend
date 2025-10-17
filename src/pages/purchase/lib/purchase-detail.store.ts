import { create } from "zustand";
import type {
  PurchaseDetailResource,
  Meta,
  CreatePurchaseDetailRequestFull,
  UpdatePurchaseDetailRequest,
} from "./purchase.interface";
import {
  getPurchaseDetails,
  getPurchaseDetailById,
  createPurchaseDetail,
  updatePurchaseDetail,
  deletePurchaseDetail,
  type GetPurchaseDetailsParams,
} from "./purchase.actions";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";

interface PurchaseDetailStore {
  // State
  details: PurchaseDetailResource[] | null;
  detail: PurchaseDetailResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchDetails: (purchaseId: number, params?: GetPurchaseDetailsParams) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  createDetail: (data: CreatePurchaseDetailRequestFull) => Promise<void>;
  updateDetail: (id: number, data: UpdatePurchaseDetailRequest) => Promise<void>;
  deleteDetail: (id: number) => Promise<void>;
  resetDetail: () => void;
}

export const usePurchaseDetailStore = create<PurchaseDetailStore>((set) => ({
  // Initial state
  details: null,
  detail: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Fetch details for a purchase
  fetchDetails: async (purchaseId: number, params?: GetPurchaseDetailsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPurchaseDetails(purchaseId, params);
      const meta: Meta = {
        current_page: response.current_page,
        from: response.from,
        last_page: response.last_page,
        per_page: response.per_page,
        to: response.to,
        total: response.total,
      };
      set({ details: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar los detalles", isLoading: false });
      errorToast("Error al cargar los detalles");
    }
  },

  // Fetch single detail by ID
  fetchDetail: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await getPurchaseDetailById(id);
      set({ detail: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar el detalle", isFinding: false });
      errorToast("Error al cargar el detalle");
    }
  },

  // Create new detail
  createDetail: async (data: CreatePurchaseDetailRequestFull) => {
    set({ isSubmitting: true, error: null });
    try {
      await createPurchaseDetail(data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE({ name: "Detalle", gender: false }, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE({ name: "Detalle", gender: false }, "create"), isSubmitting: false });
      errorToast(ERROR_MESSAGE({ name: "Detalle", gender: false }, "create"));
      throw error;
    }
  },

  // Update detail
  updateDetail: async (id: number, data: UpdatePurchaseDetailRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePurchaseDetail(id, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE({ name: "Detalle", gender: false }, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE({ name: "Detalle", gender: false }, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE({ name: "Detalle", gender: false }, "update"));
      throw error;
    }
  },

  // Delete detail
  deleteDetail: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deletePurchaseDetail(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE({ name: "Detalle", gender: false }, "delete"));
    } catch (error) {
      set({ error: ERROR_MESSAGE({ name: "Detalle", gender: false }, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE({ name: "Detalle", gender: false }, "delete"));
      throw error;
    }
  },

  // Reset detail state
  resetDetail: () => {
    set({ detail: null, error: null });
  },
}));
