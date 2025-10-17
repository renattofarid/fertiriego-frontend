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
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { PURCHASE_PAYMENT } from "./purchase.interface";

const { MODEL } = PURCHASE_PAYMENT;

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
      set({ error: "Error al cargar los pagos", isLoading: false });
      errorToast("Error al cargar los pagos");
    }
  },

  // Fetch single payment by ID
  fetchPayment: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await getPurchasePaymentById(id);
      set({ payment: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar el pago", isFinding: false });
      errorToast("Error al cargar el pago");
    }
  },

  // Create new payment
  createPayment: async (data: CreatePurchasePaymentRequest | FormData) => {
    set({ isSubmitting: true, error: null });
    try {
      await createPurchasePayment(data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "create"));
      throw error;
    }
  },

  // Update payment
  updatePayment: async (id: number, data: UpdatePurchasePaymentRequest | FormData) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePurchasePayment(id, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deletePurchasePayment(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
      throw error;
    }
  },

  // Reset payment state
  resetPayment: () => {
    set({ payment: null, error: null });
  },
}));
