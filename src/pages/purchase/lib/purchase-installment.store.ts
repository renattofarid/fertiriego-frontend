import { create } from "zustand";
import type {
  PurchaseInstallmentResource,
  Meta,
  CreatePurchaseInstallmentRequestFull,
  UpdatePurchaseInstallmentRequest,
} from "./purchase.interface";
import {
  getPurchaseInstallments,
  getPurchaseInstallmentById,
  createPurchaseInstallment,
  updatePurchaseInstallment,
  type GetPurchaseInstallmentsParams,
} from "./purchase.actions";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { PURCHASE_INSTALLMENT } from "./purchase.interface";

const { MODEL } = PURCHASE_INSTALLMENT;

interface PurchaseInstallmentStore {
  // State
  installments: PurchaseInstallmentResource[] | null;
  installment: PurchaseInstallmentResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchInstallments: (purchaseId: number, params?: GetPurchaseInstallmentsParams) => Promise<void>;
  fetchInstallment: (id: number) => Promise<void>;
  createInstallment: (data: CreatePurchaseInstallmentRequestFull) => Promise<void>;
  updateInstallment: (id: number, data: UpdatePurchaseInstallmentRequest) => Promise<void>;
  resetInstallment: () => void;
}

export const usePurchaseInstallmentStore = create<PurchaseInstallmentStore>((set) => ({
  // Initial state
  installments: null,
  installment: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Fetch installments for a purchase
  fetchInstallments: async (purchaseId: number, params?: GetPurchaseInstallmentsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPurchaseInstallments(purchaseId, params);
      const meta: Meta = {
        current_page: response.current_page,
        from: response.from,
        last_page: response.last_page,
        per_page: response.per_page,
        to: response.to,
        total: response.total,
      };
      set({ installments: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar las cuotas", isLoading: false });
      errorToast("Error al cargar las cuotas");
    }
  },

  // Fetch single installment by ID
  fetchInstallment: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await getPurchaseInstallmentById(id);
      set({ installment: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar la cuota", isFinding: false });
      errorToast("Error al cargar la cuota");
    }
  },

  // Create new installment
  createInstallment: async (data: CreatePurchaseInstallmentRequestFull) => {
    set({ isSubmitting: true, error: null });
    try {
      await createPurchaseInstallment(data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "create"));
      throw error;
    }
  },

  // Update installment
  updateInstallment: async (id: number, data: UpdatePurchaseInstallmentRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePurchaseInstallment(id, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Reset installment state
  resetInstallment: () => {
    set({ installment: null, error: null });
  },
}));
