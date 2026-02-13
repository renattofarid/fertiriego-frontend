import { create } from "zustand";
import type {
  PurchaseResource,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
} from "./purchase.interface";
import {
  findPurchaseById,
  storePurchase,
  updatePurchase,
  deletePurchase,
} from "./purchase.actions";
import type { PurchaseSchema, PurchaseUpdateSchema } from "./purchase.schema";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { PURCHASE } from "./purchase.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = PURCHASE;

interface PurchaseStore {
  // State
  allPurchases: PurchaseResource[] | null;
  purchases: PurchaseResource[] | null;
  purchase: PurchaseResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  // Actions
  fetchPurchase: (id: number) => Promise<void>;
  createPurchase: (data: PurchaseSchema) => Promise<void>;
  updatePurchase: (
    id: number,
    data: Partial<PurchaseUpdateSchema>,
  ) => Promise<void>;
  removePurchase: (id: number) => Promise<void>;
  resetPurchase: () => void;
}

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  // Initial state
  allPurchases: null,
  purchases: null,
  purchase: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,
  // Fetch single purchase by ID
  fetchPurchase: async (id: number) => {
    set({ isFinding: true, error: undefined });
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
    set({ isSubmitting: true, error: undefined });
    try {
      const request: CreatePurchaseRequest = {
        supplier_id: Number(data.supplier_id),
        warehouse_id: Number(data.warehouse_id),
        user_id: Number(data.user_id),
        purchase_order_id: data.purchase_order_id
          ? Number(data.purchase_order_id)
          : null,
        document_type: data.document_type,
        document_number: data.document_number,
        issue_date: data.issue_date,
        payment_type: data.payment_type,
        currency: data.currency,
        observations: data.observations || "",
        details: data.details.map((detail) => ({
          product_id: Number(detail.product_id),
          quantity: Number(detail.quantity),
          unit_price: Number(Number(detail.unit_price).toFixed(2)),
          tax: Number(Number(detail.tax).toFixed(2)),
        })),
        installments: data.installments.map((installment) => ({
          due_days: Number(installment.due_days),
          amount: Number(Number(installment.amount).toFixed(2)),
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
    set({ isSubmitting: true, error: undefined });
    try {
      const request: UpdatePurchaseRequest = {
        ...(data.supplier_id && { supplier_id: Number(data.supplier_id) }),
        ...(data.warehouse_id && { warehouse_id: Number(data.warehouse_id) }),
        ...(data.user_id && { user_id: Number(data.user_id) }),
        ...(data.purchase_order_id !== undefined && {
          purchase_order_id: data.purchase_order_id
            ? Number(data.purchase_order_id)
            : null,
        }),
        ...(data.document_type && { document_type: data.document_type }),
        ...(data.document_number && { document_number: data.document_number }),
        ...(data.issue_date && { issue_date: data.issue_date }),
        ...(data.payment_type && { payment_type: data.payment_type }),
        ...(data.currency && { currency: data.currency }),
        ...(data.observations !== undefined && {
          observations: data.observations,
        }),
      };

      await updatePurchase(id, request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
      throw error;
    }
  },

  // Delete purchase
  removePurchase: async (id: number) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await deletePurchase(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      throw error;
    }
  },

  // Reset purchase state
  resetPurchase: () => {
    set({ purchase: null, error: undefined });
  },
}));
