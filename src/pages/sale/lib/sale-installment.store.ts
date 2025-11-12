import { create } from "zustand";
import type {
  SaleInstallmentResource,
  Meta,
  CreateSaleInstallmentRequestFull,
  UpdateSaleInstallmentRequest,
} from "./sale.interface";
import {
  getSaleInstallments,
  getSaleInstallmentById,
  createSaleInstallment,
  updateSaleInstallment,
  deleteSaleInstallment,
  type GetSaleInstallmentsParams,
} from "./sale.actions";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { SALE_INSTALLMENT } from "./sale.interface";

const { MODEL } = SALE_INSTALLMENT;

interface SaleInstallmentStore {
  // State
  installments: SaleInstallmentResource[] | null;
  installment: SaleInstallmentResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchInstallments: (params?: GetSaleInstallmentsParams) => Promise<void>;
  fetchInstallment: (id: number) => Promise<void>;
  createInstallment: (data: CreateSaleInstallmentRequestFull) => Promise<void>;
  updateInstallment: (id: number, data: UpdateSaleInstallmentRequest) => Promise<void>;
  deleteInstallment: (id: number) => Promise<void>;
  resetInstallment: () => void;
}

export const useSaleInstallmentStore = create<SaleInstallmentStore>((set) => ({
  // Initial state
  installments: null,
  installment: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Fetch installments for a sale
  fetchInstallments: async (params?: GetSaleInstallmentsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getSaleInstallments(params);
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
      const response = await getSaleInstallmentById(id);
      set({ installment: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar la cuota", isFinding: false });
      errorToast("Error al cargar la cuota");
    }
  },

  // Create new installment
  createInstallment: async (data: CreateSaleInstallmentRequestFull) => {
    set({ isSubmitting: true, error: null });
    try {
      await createSaleInstallment(data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "create"));
      throw error;
    }
  },

  // Update installment
  updateInstallment: async (id: number, data: UpdateSaleInstallmentRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateSaleInstallment(id, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Delete installment
  deleteInstallment: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteSaleInstallment(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
      throw error;
    }
  },

  // Reset installment state
  resetInstallment: () => {
    set({ installment: null, error: null });
  },
}));
