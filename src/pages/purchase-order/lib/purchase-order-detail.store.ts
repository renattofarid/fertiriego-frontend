import { create } from "zustand";
import {
  getPurchaseOrderDetails,
  getPurchaseOrderDetailById,
  createPurchaseOrderDetail,
  updatePurchaseOrderDetail,
  deletePurchaseOrderDetail,
} from "./purchase-order.actions";
import type { Meta } from "@/lib/pagination.interface";
import type {
  PurchaseOrderDetailResource,
  CreatePurchaseOrderDetailRequestFull,
  UpdatePurchaseOrderDetailRequest,
} from "./purchase-order.interface";

interface PurchaseOrderDetailStore {
  details: PurchaseOrderDetailResource[] | null;
  detail: PurchaseOrderDetailResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchDetails: (
    purchaseOrderId: number,
    params?: Record<string, any>
  ) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  createDetail: (data: CreatePurchaseOrderDetailRequestFull) => Promise<void>;
  updateDetail: (
    id: number,
    data: UpdatePurchaseOrderDetailRequest
  ) => Promise<void>;
  deleteDetail: (id: number) => Promise<void>;
  resetDetail: () => void;
}

export const usePurchaseOrderDetailStore = create<PurchaseOrderDetailStore>(
  (set) => ({
    details: null,
    detail: null,
    meta: undefined,
    isLoading: false,
    isFinding: false,
    isSubmitting: false,
    error: undefined,

    fetchDetails: async (
      purchaseOrderId: number,
      params?: Record<string, any>
    ) => {
      set({ isLoading: true, error: undefined});
      try {
        const { data, meta } = await getPurchaseOrderDetails({
          purchaseOrderId,
          params,
        });
        set({ details: data, meta: meta, isLoading: false });
      } catch (err) {
        set({
          error: "Error al cargar los detalles de la orden",
          isLoading: false,
        });
      }
    },

    fetchDetail: async (id: number) => {
      set({ isFinding: true, error: undefined});
      try {
        const { data } = await getPurchaseOrderDetailById(id);
        set({ detail: data, isFinding: false });
      } catch (err) {
        set({ error: "Error al cargar el detalle", isFinding: false });
      }
    },

    createDetail: async (data: CreatePurchaseOrderDetailRequestFull) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await createPurchaseOrderDetail(data);
      } catch (err) {
        set({ error: "Error al crear el detalle" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateDetail: async (
      id: number,
      data: UpdatePurchaseOrderDetailRequest
    ) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await updatePurchaseOrderDetail(id, data);
      } catch (err) {
        set({ error: "Error al actualizar el detalle" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    deleteDetail: async (id: number) => {
      set({ error: undefined});
      try {
        await deletePurchaseOrderDetail(id);
      } catch (err) {
        set({ error: "Error al eliminar el detalle" });
        throw err;
      }
    },

    resetDetail: () => {
      set({ detail: null });
    },
  })
);
