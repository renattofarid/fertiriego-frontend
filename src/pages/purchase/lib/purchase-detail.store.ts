import { create } from "zustand";
import type {
  PurchaseDetailResource,
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
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { PURCHASE_DETAIL } from "./purchase.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = PURCHASE_DETAIL;

interface PurchaseDetailStore {
  // State
  details: PurchaseDetailResource[] | null;
  detail: PurchaseDetailResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  // Actions
  fetchDetails: (
    purchaseId: number,
    params?: GetPurchaseDetailsParams
  ) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  createDetail: (data: CreatePurchaseDetailRequestFull) => Promise<void>;
  updateDetail: (
    id: number,
    data: UpdatePurchaseDetailRequest
  ) => Promise<void>;
  deleteDetail: (id: number) => Promise<void>;
  resetDetail: () => void;
}

export const usePurchaseDetailStore = create<PurchaseDetailStore>((set) => ({
  // Initial state
  details: null,
  detail: null,
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  // Fetch details for a purchase
  fetchDetails: async (
    purchaseId: number,
    params?: GetPurchaseDetailsParams
  ) => {
    set({ isLoading: true, error: undefined});
    try {
      const response = await getPurchaseDetails(purchaseId, params);
      const meta = response.meta;
      set({ details: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar los detalles", isLoading: false });
      errorToast("Error al cargar los detalles");
    }
  },

  // Fetch single detail by ID
  fetchDetail: async (id: number) => {
    set({ isFinding: true, error: undefined});
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
    set({ isSubmitting: true, error: undefined});
    try {
      await createPurchaseDetail(data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "create"));
      throw error;
    }
  },

  // Update detail
  updateDetail: async (id: number, data: UpdatePurchaseDetailRequest) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updatePurchaseDetail(id, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "edit"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "edit"));
      throw error;
    }
  },

  // Delete detail
  deleteDetail: async (id: number) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await deletePurchaseDetail(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
      throw error;
    }
  },

  // Reset detail state
  resetDetail: () => {
    set({ detail: null, error: undefined});
  },
}));
