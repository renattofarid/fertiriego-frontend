import { create } from "zustand";
import type {
  SaleDetailResource,
  Meta,
  CreateSaleDetailRequestFull,
  UpdateSaleDetailRequest,
} from "./sale.interface";
import {
  getSaleDetails,
  getSaleDetailById,
  createSaleDetail,
  updateSaleDetail,
  deleteSaleDetail,
  type GetSaleDetailsParams,
} from "./sale.actions";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { SALE_DETAIL } from "./sale.interface";

const { MODEL } = SALE_DETAIL;

interface SaleDetailStore {
  // State
  details: SaleDetailResource[] | null;
  detail: SaleDetailResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchDetails: (saleId: number, params?: GetSaleDetailsParams) => Promise<void>;
  fetchDetail: (saleId: number, detailId: number) => Promise<void>;
  createDetail: (saleId: number, data: CreateSaleDetailRequestFull) => Promise<void>;
  updateDetail: (saleId: number, detailId: number, data: UpdateSaleDetailRequest) => Promise<void>;
  deleteDetail: (saleId: number, detailId: number) => Promise<void>;
  resetDetail: () => void;
}

export const useSaleDetailStore = create<SaleDetailStore>((set) => ({
  // Initial state
  details: null,
  detail: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Fetch details for a sale
  fetchDetails: async (saleId: number, params?: GetSaleDetailsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getSaleDetails(saleId, params);
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
  fetchDetail: async (saleId: number, detailId: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await getSaleDetailById(saleId, detailId);
      set({ detail: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar el detalle", isFinding: false });
      errorToast("Error al cargar el detalle");
    }
  },

  // Create new detail
  createDetail: async (saleId: number, data: CreateSaleDetailRequestFull) => {
    set({ isSubmitting: true, error: null });
    try {
      await createSaleDetail(saleId, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "create"));
      throw error;
    }
  },

  // Update detail
  updateDetail: async (saleId: number, detailId: number, data: UpdateSaleDetailRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateSaleDetail(saleId, detailId, data);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Delete detail
  deleteDetail: async (saleId: number, detailId: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteSaleDetail(saleId, detailId);
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
    set({ detail: null, error: null });
  },
}));
