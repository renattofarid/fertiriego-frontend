import { create } from "zustand";
import type {
  PurchaseResource,
  Meta,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
} from "./purchase.interface";
import {
  getPurchases,
  getAllPurchases,
  findPurchaseById,
  storePurchase,
  updatePurchase,
  deletePurchase,
  type GetPurchasesParams,
} from "./purchase.actions";
import type { PurchaseSchema, PurchaseUpdateSchema } from "./purchase.schema";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { PURCHASE } from "./purchase.interface";

const { MODEL } = PURCHASE;

interface PurchaseStore {
  // State
  allPurchases: PurchaseResource[] | null;
  purchases: PurchaseResource[] | null;
  purchase: PurchaseResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchAllPurchases: () => Promise<void>;
  fetchPurchases: (params?: GetPurchasesParams) => Promise<void>;
  fetchPurchase: (id: number) => Promise<void>;
  createPurchase: (data: PurchaseSchema) => Promise<void>;
  updatePurchase: (id: number, data: Partial<PurchaseUpdateSchema>) => Promise<void>;
  removePurchase: (id: number) => Promise<void>;
  resetPurchase: () => void;
}

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  // Initial state
  allPurchases: null,
  purchases: null,
  purchase: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Fetch all purchases (no pagination)
  fetchAllPurchases: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllPurchases();
      set({ allPurchases: data, isLoadingAll: false });
    } catch (error) {
      set({ error: "Error al cargar las compras", isLoadingAll: false });
      errorToast("Error al cargar las compras");
    }
  },

  // Fetch purchases with pagination
  fetchPurchases: async (params?: GetPurchasesParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPurchases(params);
      const meta: Meta = {
        current_page: response.current_page,
        from: response.from,
        last_page: response.last_page,
        per_page: response.per_page,
        to: response.to,
        total: response.total,
      };
      set({ purchases: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar las compras", isLoading: false });
      errorToast("Error al cargar las compras");
    }
  },

  // Fetch single purchase by ID
  fetchPurchase: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await findPurchaseById(id);
      set({ purchase: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar la compra", isFinding: false });
      errorToast("Error al cargar la compra");
    }
  },

  // Create new purchase
  createPurchase: async (data: PurchaseSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreatePurchaseRequest = {
        supplier_id: Number(data.supplier_id),
        warehouse_id: Number(data.warehouse_id),
        user_id: Number(data.user_id),
        purchase_order_id: data.purchase_order_id ? Number(data.purchase_order_id) : null,
        document_type: data.document_type,
        document_number: data.document_number,
        issue_date: data.issue_date,
        payment_type: data.payment_type,
        currency: data.currency,
        observations: data.observations || "",
        details: data.details.map((detail) => ({
          product_id: Number(detail.product_id),
          quantity: Number(detail.quantity),
          unit_price: Number(detail.unit_price),
          tax: Number(detail.tax),
        })),
        installments: data.installments.map((installment) => ({
          due_days: Number(installment.due_days),
          amount: Number(installment.amount),
        })),
      };

      await storePurchase(request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update purchase
  updatePurchase: async (id: number, data: Partial<PurchaseUpdateSchema>) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: UpdatePurchaseRequest = {
        ...(data.supplier_id && { supplier_id: Number(data.supplier_id) }),
        ...(data.warehouse_id && { warehouse_id: Number(data.warehouse_id) }),
        ...(data.user_id && { user_id: Number(data.user_id) }),
        ...(data.purchase_order_id !== undefined && {
          purchase_order_id: data.purchase_order_id ? Number(data.purchase_order_id) : null,
        }),
        ...(data.document_type && { document_type: data.document_type }),
        ...(data.document_number && { document_number: data.document_number }),
        ...(data.issue_date && { issue_date: data.issue_date }),
        ...(data.payment_type && { payment_type: data.payment_type }),
        ...(data.currency && { currency: data.currency }),
        ...(data.observations !== undefined && { observations: data.observations }),
      };

      await updatePurchase(id, request);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Delete purchase
  removePurchase: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deletePurchase(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
      throw error;
    }
  },

  // Reset purchase state
  resetPurchase: () => {
    set({ purchase: null, error: null });
  },
}));
