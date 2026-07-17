import { create } from "zustand";
import type {
  ProductionOrderResource,
  ProductionOrderDetailResource,
  CreateProductionOrderRequest,
  UpdateProductionOrderRequest,
  GetProductionOrdersParams,
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
} from "./production-order.actions";
import type { ProductionOrderSchema } from "./production-order.schema";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { PRODUCTION_ORDER } from "./production-order.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = PRODUCTION_ORDER;

interface ProductionOrderStore {
  orders: ProductionOrderResource[] | null;
  order: ProductionOrderDetailResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

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
}

export const useProductionOrderStore = create<ProductionOrderStore>((set) => ({
  orders: null,
  order: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

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
        product_id: Number(data.product_id),
        responsible_id: Number(data.responsible_id),
        requested_date: data.requested_date,
        quantity_requested: Number(data.quantity_requested),
        currency: data.currency || "PEN",
        labor_cost: data.labor_cost ? Number(data.labor_cost) : 0,
        observations: data.observations || undefined,
        components: data.components.map((c) => ({
          component_id: Number(c.component_id),
          quantity_required: Number(c.quantity_required),
          unit_cost: c.unit_cost ? Number(c.unit_cost) : undefined,
          notes: c.notes || undefined,
        })),
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
        ...(data.product_id && { product_id: Number(data.product_id) }),
        ...(data.responsible_id && { responsible_id: Number(data.responsible_id) }),
        ...(data.requested_date && { requested_date: data.requested_date }),
        ...(data.quantity_requested && { quantity_requested: Number(data.quantity_requested) }),
        ...(data.currency !== undefined && { currency: data.currency || "PEN" }),
        ...(data.labor_cost !== undefined && { labor_cost: Number(data.labor_cost) || 0 }),
        ...(data.observations !== undefined && { observations: data.observations || undefined }),
        ...(data.components && {
          components: data.components.map((c) => ({
            component_id: Number(c.component_id),
            quantity_required: Number(c.quantity_required),
            unit_cost: c.unit_cost ? Number(c.unit_cost) : undefined,
            notes: c.notes || undefined,
          })),
        }),
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
}));
