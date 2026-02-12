import { create } from "zustand";
import type {
  PurchasePaymentResource,
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
import { PURCHASE_PAYMENT } from "./purchase.interface";
import type { Meta } from "@/lib/pagination.interface";
import { ERROR_MESSAGE } from "@/lib/core.function";

const { MODEL } = PURCHASE_PAYMENT;

interface PurchasePaymentStore {
  // State
  payments: PurchasePaymentResource[] | null;
  payment: PurchasePaymentResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  // Actions
  fetchPayments: (
    installmentId: number,
    params?: GetPurchasePaymentsParams
  ) => Promise<void>;
  fetchPayment: (id: number) => Promise<void>;
  createPayment: (
    data: CreatePurchasePaymentRequest | FormData
  ) => Promise<void>;
  updatePayment: (
    id: number,
    data: UpdatePurchasePaymentRequest | FormData
  ) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  resetPayment: () => void;
}

export const usePurchasePaymentStore = create<PurchasePaymentStore>((set) => ({
  // Initial state
  payments: null,
  payment: null,
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  // Fetch payments for an installment
  fetchPayments: async (
    installmentId: number,
    params?: GetPurchasePaymentsParams
  ) => {
    set({ isLoading: true, error: undefined });
    try {
      const response = await getPurchasePayments(installmentId, params);
      const meta = response.meta;
      set({ payments: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar los pagos", isLoading: false });
    }
  },

  // Fetch single payment by ID
  fetchPayment: async (id: number) => {
    set({ isFinding: true, error: undefined });
    try {
      const response = await getPurchasePaymentById(id);
      set({ payment: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar el pago", isFinding: false });
    }
  },

  // Create new payment
  createPayment: async (data: CreatePurchasePaymentRequest | FormData) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await createPurchasePayment(data);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update payment
  updatePayment: async (
    id: number,
    data: UpdatePurchasePaymentRequest | FormData
  ) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await updatePurchasePayment(id, data);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (id: number) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await deletePurchasePayment(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      throw error;
    }
  },

  // Reset payment state
  resetPayment: () => {
    set({ payment: null, error: undefined });
  },
}));
