import { create } from "zustand";
import {
  findPurchaseOrderById,
  getAllPurchaseOrders,
  getPurchaseOrders,
  storePurchaseOrder,
  updatePurchaseOrder,
} from "./purchase-order.actions";
import type { PurchaseOrderSchema } from "./purchase-order.schema";
import type { Meta } from "@/lib/pagination.interface";
import type {
  PurchaseOrderResource,
  CreatePurchaseOrderRequest,
} from "./purchase-order.interface";

interface PurchaseOrderStore {
  allPurchaseOrders: PurchaseOrderResource[] | null;
  purchaseOrders: PurchaseOrderResource[] | null;
  purchaseOrder: PurchaseOrderResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllPurchaseOrders: () => Promise<void>;
  fetchPurchaseOrders: (params?: Record<string, any>) => Promise<void>;
  fetchPurchaseOrder: (id: number) => Promise<void>;
  createPurchaseOrder: (data: PurchaseOrderSchema) => Promise<void>;
  updatePurchaseOrder: (
    id: number,
    data: Partial<PurchaseOrderSchema>
  ) => Promise<void>;
}

export const usePurchaseOrderStore = create<PurchaseOrderStore>((set) => ({
  allPurchaseOrders: null,
  purchaseOrder: null,
  purchaseOrders: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchPurchaseOrders: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getPurchaseOrders({ params });
      set({ purchaseOrders: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar órdenes de compra", isLoading: false });
    }
  },

  fetchAllPurchaseOrders: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllPurchaseOrders();
      set({ allPurchaseOrders: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar órdenes de compra", isLoadingAll: false });
    }
  },

  fetchPurchaseOrder: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findPurchaseOrderById(id);
      set({ purchaseOrder: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la orden de compra", isFinding: false });
    }
  },

  createPurchaseOrder: async (data: PurchaseOrderSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreatePurchaseOrderRequest = {
        supplier_id: Number(data.supplier_id),
        warehouse_id: Number(data.warehouse_id),
        issue_date: data.issue_date,
        expected_date: data.expected_date,
        observations: data.observations || "",
        // Coerce apply_igv to boolean (handle 0/1 or "0"/"1")
        apply_igv: !!(data as any).apply_igv,
        details: data.details.map((detail) => {
          const qty = Number(detail.quantity_requested);
          const price = Number(detail.unit_price_estimated);
          const subtotal = Number((qty * price).toFixed(2));
          return {
            product_id: Number(detail.product_id),
            quantity_requested: qty,
            unit_price_estimated: price,
            subtotal_estimated: subtotal,
          };
        }),
        total_estimated: data.details
          .map(
            (d) => Number(d.quantity_requested) * Number(d.unit_price_estimated)
          )
          .reduce((a, b) => a + b, 0),
      };
      await storePurchaseOrder(request);
    } catch (err) {
      set({ error: "Error al crear la Orden de Compra" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePurchaseOrder: async (
    id: number,
    data: Partial<PurchaseOrderSchema>
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: any = {};
      if (data.supplier_id) request.supplier_id = Number(data.supplier_id);
      if (data.warehouse_id) request.warehouse_id = Number(data.warehouse_id);
      if (data.issue_date) request.issue_date = data.issue_date;
      if (data.expected_date) request.expected_date = data.expected_date;
      if (data.observations !== undefined)
        request.observations = data.observations;
      // If apply_igv is provided in update payload, coerce to boolean
      if ((data as any).apply_igv !== undefined) {
        request.apply_igv = !!(data as any).apply_igv;
      }

      await updatePurchaseOrder(id, request);
    } catch (err) {
      set({ error: "Error al actualizar la Orden de Compra" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
