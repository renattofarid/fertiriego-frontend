import { create } from "zustand";
import type {
  SalePaymentResource,
  CreateSalePaymentRequest,
  UpdateSalePaymentRequest,
} from "./sale.interface";
import {
  getSalePayments,
  getSalePaymentById,
  createSalePayment,
  updateSalePayment,
  deleteSalePayment,
  type GetSalePaymentsParams,
} from "./sale.actions";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { SALE_PAYMENT } from "./sale.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = SALE_PAYMENT;

interface SalePaymentStore {
  // State
  payments: SalePaymentResource[] | null;
  payment: SalePaymentResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  // Actions
  fetchPayments: (installmentId: number, params?: GetSalePaymentsParams) => Promise<void>;
  fetchPayment: (installmentId: number, paymentId: number) => Promise<void>;
  createPayment: (installmentId: number, data: CreateSalePaymentRequest) => Promise<void>;
  updatePayment: (installmentId: number, paymentId: number, data: UpdateSalePaymentRequest) => Promise<void>;
  deletePayment: (installmentId: number, paymentId: number) => Promise<void>;
  resetPayment: () => void;
}

export const useSalePaymentStore = create<SalePaymentStore>((set) => ({
  // Initial state
  payments: null,
  payment: null,
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  // Fetch payments for an installment
  fetchPayments: async (installmentId: number, params?: GetSalePaymentsParams) => {
    set({ isLoading: true, error: undefined});
    try {
      const response = await getSalePayments(installmentId, params);
      const meta: Meta = response.meta;
      set({ payments: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar los pagos", isLoading: false });
      errorToast("Error al cargar los pagos");
    }
  },

  // Fetch single payment by ID
  fetchPayment: async (installmentId: number, paymentId: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const response = await getSalePaymentById(installmentId, paymentId);
      set({ payment: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar el pago", isFinding: false });
      errorToast("Error al cargar el pago");
    }
  },

  // Create new payment
  createPayment: async (installmentId: number, data: CreateSalePaymentRequest) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await createSalePayment(installmentId, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "create"));
      throw error;
    }
  },

  // Update payment
  updatePayment: async (installmentId: number, paymentId: number, data: UpdateSalePaymentRequest) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateSalePayment(installmentId, paymentId, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "edit"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "edit"));
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (installmentId: number, paymentId: number) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await deleteSalePayment(installmentId, paymentId);
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
    set({ payment: null, error: undefined});
  },
}));
