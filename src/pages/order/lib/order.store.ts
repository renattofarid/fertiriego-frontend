import { create } from "zustand";
import type {
  OrderResource,
  CreateOrderRequest,
  UpdateOrderRequest,
} from "./order.interface";
import {
  getOrders,
  getAllOrders,
  findOrderById,
  storeOrder,
  updateOrder,
  deleteOrder,
  type GetOrdersParams,
} from "./order.actions";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { ORDER } from "./order.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = ORDER;

interface OrderStore {
  // State
  allOrders: OrderResource[] | null;
  orders: OrderResource[] | null;
  order: OrderResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  // Actions
  fetchAllOrders: () => Promise<void>;
  fetchOrders: (params?: GetOrdersParams) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  createOrder: (data: CreateOrderRequest) => Promise<OrderResource>;
  updateOrder: (id: number, data: UpdateOrderRequest) => Promise<void>;
  removeOrder: (id: number) => Promise<void>;
  resetOrder: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  // Initial state
  allOrders: null,
  orders: null,
  order: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  // Fetch all orders (no pagination)
  fetchAllOrders: async () => {
    set({ isLoadingAll: true, error: undefined });
    try {
      const data = await getAllOrders();
      set({ allOrders: data, isLoadingAll: false });
    } catch (error) {
      set({ error: "Error al cargar los pedidos", isLoadingAll: false });
      errorToast("Error al cargar los pedidos");
    }
  },

  // Fetch orders with pagination
  fetchOrders: async (params?: GetOrdersParams) => {
    set({ isLoading: true, error: undefined });
    try {
      const response = await getOrders(params);
      const meta = response.meta;
      set({ orders: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar los pedidos", isLoading: false });
      errorToast("Error al cargar los pedidos");
    }
  },

  // Fetch single order by ID
  fetchOrder: async (id: number) => {
    set({ isFinding: true, error: undefined });
    try {
      const response = await findOrderById(id);
      set({ order: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar el pedido", isFinding: false });
      errorToast("Error al cargar el pedido");
    }
  },

  // Create new order
  createOrder: async (data: CreateOrderRequest) => {
    set({ isSubmitting: true, error: undefined });
    try {
      const response = await storeOrder(data);
      set({ isSubmitting: false });
      return response.data;
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update order
  updateOrder: async (id: number, data: UpdateOrderRequest) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await updateOrder(id, data);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      throw error;
    }
  },

  // Delete order
  removeOrder: async (id: number) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await deleteOrder(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      throw error;
    }
  },

  // Reset order state
  resetOrder: () => {
    set({ order: null, error: undefined });
  },
}));
