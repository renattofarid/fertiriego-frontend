import { create } from "zustand";
import type {
  PurchasePaymentResource,
  Meta,
  CreatePurchasePaymentRequest,
  UpdatePurchasePaymentRequest,
} from "./purchase.interface";
import {
  getPurchasePayments,
  getPurchasePaymentById,
  createPurchasePayment,
  updatePurchasePayment,
  deletePurchasePayment,
  type GetPurchasePaymentsParams,
} from "./purchase.actions";
import { errorToast, successToast } from "@/shared/utils/toast.util";
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from "@/shared/utils/constants.util";

interface PurchasePaymentStore {
  // State
  payments: PurchasePaymentResource[] | null;
  payment: PurchasePaymentResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchPayments: (installmentId: number, params?: GetPurchasePaymentsParams) => Promise<void>;
  fetchPayment: (id: number) => Promise<void>;
  createPayment: (data: CreatePurchasePaymentRequest | FormData) => Promise<void>;
  updatePayment: (id: number, data: UpdatePurchasePaymentRequest | FormData) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  resetPayment: () => void;
}

export const usePurchasePaymentStore = create<PurchasePaymentStore>((set) => ({
  // Initial state
  payments: null,
  payment: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Fetch payments for an installment
  fetchPayments: async (installmentId: number, params?: GetPurchasePaymentsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPurchasePayments(installmentId, params);
      const meta: Meta = {
        current_page: response.current_page,
        from: response.from,
        last_page: response.last_page,
        per_page: response.per_page,
        to: response.to,
        total: response.total,
      };
      set({ payments: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE, isLoading: false });
      errorToast(ERROR_MESSAGE);
    }
  },

  // Fetch single payment by ID
  fetchPayment: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await getPurchasePaymentById(id);
      set({ payment: response.data, isFinding: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE, isFinding: false });
      errorToast(ERROR_MESSAGE);
    }
  },

  // Create new payment
  createPayment: async (data: CreatePurchasePaymentRequest | FormData) => {
    set({ isSubmitting: true, error: null });
    try {
      await createPurchasePayment(data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE);
    } catch (error) {
      set({ error: ERROR_MESSAGE, isSubmitting: false });
      errorToast(ERROR_MESSAGE);
      throw error;
    }
  },

  // Update payment
  updatePayment: async (id: number, data: UpdatePurchasePaymentRequest | FormData) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePurchasePayment(id, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE);
    } catch (error) {
      set({ error: ERROR_MESSAGE, isSubmitting: false });
      errorToast(ERROR_MESSAGE);
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deletePurchasePayment(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE);
    } catch (error) {
      set({ error: ERROR_MESSAGE, isSubmitting: false });
      errorToast(ERROR_MESSAGE);
      throw error;
    }
  },

  // Reset payment state
  resetPayment: () => {
    set({ payment: null, error: null });
  },
}));
