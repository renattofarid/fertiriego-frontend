import { create } from "zustand";
import type {
  PurchaseInstallmentResource,
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
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = PURCHASE_INSTALLMENT;

interface PurchaseInstallmentStore {
  // State
  installments: PurchaseInstallmentResource[] | null;
  installment: PurchaseInstallmentResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

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
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  // Fetch installments for a purchase
  fetchInstallments: async (purchaseId: number, params?: GetPurchaseInstallmentsParams) => {
    set({ isLoading: true, error: undefined});
    try {
      const response = await getPurchaseInstallments(purchaseId, params);
      const meta = response.meta;
      set({ installments: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar las cuotas", isLoading: false });
      errorToast("Error al cargar las cuotas");
    }
  },

  // Fetch single installment by ID
  fetchInstallment: async (id: number) => {
    set({ isFinding: true, error: undefined});
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
    set({ isSubmitting: true, error: undefined});
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
    set({ isSubmitting: true, error: undefined});
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
    set({ installment: null, error: undefined});
  },
}));
