import { create } from "zustand";
import type {
  ProductionOrderResource,
  ProductionOrderDetailResource,
  CreateProductionOrderRequest,
  UpdateProductionOrderRequest,
  GetProductionOrdersParams,
  ProductionOrderSummary,
  ProductionOrderPendingItem,
  ProductionOrderItemHistoryEntry,
} from "./production-order.interface";
import {
  getProductionOrders,
  findProductionOrderById,
  storeProductionOrder,
  updateProductionOrder,
  deleteProductionOrder,
  submitProductionOrder,
  approveProductionOrder,
  rejectProductionOrder,
  cancelProductionOrder,
  getProductionOrdersSummary,
  getProductionOrdersPending,
  getProductionOrderItemHistory,
} from "./production-order.actions";
import type { ProductionOrderSchema } from "./production-order.schema";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { PRODUCTION_ORDER } from "./production-order.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = PRODUCTION_ORDER;

const buildItemsRequest = (items: ProductionOrderSchema["items"]) =>
  items.map((item) => ({
    product_id: Number(item.product_id),
    quantity_requested: Number(item.quantity_requested),
    labor_cost: item.labor_cost ? Number(item.labor_cost) : 0,
    // ⚠️ overhead_cost NO se envía: el backend lo calcula automáticamente,
    // no es un campo que el usuario ingrese manualmente.
    notes: item.notes || undefined,
    // ✅ Si el usuario no agregó componentes manualmente, no se envía el
    // arreglo y el backend autocompleta desde el combo (BOM) del producto.
    components:
      item.components && item.components.length > 0
        ? item.components.map((c) => ({
            component_id: Number(c.component_id),
            quantity_required: Number(c.quantity_required),
            unit_cost: c.unit_cost ? Number(c.unit_cost) : undefined,
            waste_quantity: c.waste_quantity ? Number(c.waste_quantity) : undefined,
            waste_percentage: c.waste_percentage ? Number(c.waste_percentage) : undefined,
            notes: c.notes || undefined,
          }))
        : undefined,
  }));

interface ProductionOrderStore {
  orders: ProductionOrderResource[] | null;
  order: ProductionOrderDetailResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  summary: ProductionOrderSummary | null;
  isLoadingSummary: boolean;

  pending: ProductionOrderPendingItem[] | null;
  isLoadingPending: boolean;

  itemHistory: ProductionOrderItemHistoryEntry[] | null;
  isLoadingItemHistory: boolean;

  fetchOrders: (params?: GetProductionOrdersParams) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  createOrder: (data: ProductionOrderSchema) => Promise<void>;
  updateOrder: (id: number, data: Partial<ProductionOrderSchema>) => Promise<void>;
  removeOrder: (id: number) => Promise<void>;
  submitOrder: (id: number) => Promise<void>;
  approveOrder: (id: number) => Promise<void>;
  rejectOrder: (id: number, rejection_reason: string) => Promise<void>;
  cancelOrder: (id: number) => Promise<void>;
  resetOrder: () => void;

  fetchSummary: () => Promise<void>;
  fetchPending: () => Promise<void>;
  fetchItemHistory: (itemId: number) => Promise<void>;
  resetItemHistory: () => void;
}

export const useProductionOrderStore = create<ProductionOrderStore>((set) => ({
  orders: null,
  order: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  summary: null,
  isLoadingSummary: false,

  pending: null,
  isLoadingPending: false,

  itemHistory: null,
  isLoadingItemHistory: false,

  fetchOrders: async (params?: GetProductionOrdersParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProductionOrders(params);
      set({ orders: response.data.data, meta: response.data.meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar las órdenes de producción", isLoading: false });
      errorToast("Error al cargar las órdenes de producción");
    }
  },

  fetchOrder: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await findProductionOrderById(id);
      set({ order: response.data.data, isFinding: false });
    } catch {
      set({ error: "Error al cargar la orden de producción", isFinding: false });
      errorToast("Error al cargar la orden de producción");
    }
  },

  createOrder: async (data: ProductionOrderSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreateProductionOrderRequest = {
        warehouse_origin_id: Number(data.warehouse_origin_id),
        warehouse_dest_id: Number(data.warehouse_dest_id),
        responsible_id: Number(data.responsible_id),
        requested_date: data.requested_date,
        currency: data.currency || "PEN",
        observations: data.observations || undefined,
        items: buildItemsRequest(data.items),
      };
      await storeProductionOrder(request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  updateOrder: async (id: number, data: Partial<ProductionOrderSchema>) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: UpdateProductionOrderRequest = {
        ...(data.warehouse_origin_id && { warehouse_origin_id: Number(data.warehouse_origin_id) }),
        ...(data.warehouse_dest_id && { warehouse_dest_id: Number(data.warehouse_dest_id) }),
        ...(data.responsible_id && { responsible_id: Number(data.responsible_id) }),
        ...(data.requested_date && { requested_date: data.requested_date }),
        ...(data.currency !== undefined && { currency: data.currency || "PEN" }),
        ...(data.observations !== undefined && { observations: data.observations || undefined }),
        ...(data.items && { items: buildItemsRequest(data.items) }),
      };
      await updateProductionOrder(id, request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
      throw error;
    }
  },

  removeOrder: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteProductionOrder(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      throw error;
    }
  },

  submitOrder: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await submitProductionOrder(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: "Error al enviar la orden de producción", isSubmitting: false });
      throw error;
    }
  },

  approveOrder: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await approveProductionOrder(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: "Error al aprobar la orden de producción", isSubmitting: false });
      throw error;
    }
  },

  rejectOrder: async (id: number, rejection_reason: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await rejectProductionOrder(id, { rejection_reason });
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: "Error al rechazar la orden de producción", isSubmitting: false });
      throw error;
    }
  },

  cancelOrder: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await cancelProductionOrder(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: "Error al anular la orden de producción", isSubmitting: false });
      throw error;
    }
  },

  resetOrder: () => {
    set({ order: null, error: null });
  },

  fetchSummary: async () => {
    set({ isLoadingSummary: true });
    try {
      const response = await getProductionOrdersSummary();
      set({ summary: response.data.data, isLoadingSummary: false });
    } catch {
      set({ isLoadingSummary: false });
      errorToast("Error al cargar el resumen de órdenes de producción");
    }
  },

  fetchPending: async () => {
    set({ isLoadingPending: true });
    try {
      const response = await getProductionOrdersPending();
      set({ pending: response.data.data, isLoadingPending: false });
    } catch {
      set({ isLoadingPending: false });
      errorToast("Error al cargar el reporte de pendientes a producir");
    }
  },

  fetchItemHistory: async (itemId: number) => {
    set({ isLoadingItemHistory: true });
    try {
      const response = await getProductionOrderItemHistory(itemId);
      set({ itemHistory: response.data.data, isLoadingItemHistory: false });
    } catch {
      set({ itemHistory: [], isLoadingItemHistory: false });
      errorToast("Error al cargar el historial de producción del ítem");
    }
  },

  resetItemHistory: () => {
    set({ itemHistory: null });
  },
}));
