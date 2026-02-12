import { create } from "zustand";
import type {
  PurchaseShippingGuideResource,
  CreatePurchaseShippingGuideRequest,
  UpdatePurchaseShippingGuideRequest,
} from "./purchase-shipping-guide.interface";
import {
  getPurchaseShippingGuides,
  getAllPurchaseShippingGuides,
  findPurchaseShippingGuideById,
  storePurchaseShippingGuide,
  updatePurchaseShippingGuide,
  deletePurchaseShippingGuide,
  assignPurchase,
  type GetPurchaseShippingGuidesParams,
} from "./purchase-shipping-guide.actions";
import type {
  PurchaseShippingGuideSchema,
  PurchaseShippingGuideUpdateSchema,
} from "./purchase-shipping-guide.schema";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { PURCHASE_SHIPPING_GUIDE } from "./purchase-shipping-guide.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = PURCHASE_SHIPPING_GUIDE;

interface PurchaseShippingGuideStore {
  // State
  allGuides: PurchaseShippingGuideResource[] | null;
  guides: PurchaseShippingGuideResource[] | null;
  guide: PurchaseShippingGuideResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  // Actions
  fetchAllGuides: () => Promise<void>;
  fetchGuides: (params?: GetPurchaseShippingGuidesParams) => Promise<void>;
  fetchGuide: (id: number) => Promise<void>;
  createGuide: (data: PurchaseShippingGuideSchema) => Promise<void>;
  updateGuide: (
    id: number,
    data: Partial<PurchaseShippingGuideUpdateSchema>
  ) => Promise<void>;
  removeGuide: (id: number) => Promise<void>;
  assignPurchaseToGuide: (id: number, purchaseId: number) => Promise<void>;
  resetGuide: () => void;
}

export const usePurchaseShippingGuideStore = create<PurchaseShippingGuideStore>(
  (set) => ({
    // Initial state
    allGuides: null,
    guides: null,
    guide: null,
    meta: undefined,
    isLoadingAll: false,
    isLoading: false,
    isFinding: false,
    isSubmitting: false,
    error: undefined,

    // Fetch all guides (no pagination)
    fetchAllGuides: async () => {
      set({ isLoadingAll: true, error: undefined});
      try {
        const data = await getAllPurchaseShippingGuides();
        set({ allGuides: data, isLoadingAll: false });
      } catch (error) {
        set({ error: "Error al cargar las guías", isLoadingAll: false });
        errorToast("Error al cargar las guías");
      }
    },

    // Fetch guides with pagination
    fetchGuides: async (params?: GetPurchaseShippingGuidesParams) => {
      set({ isLoading: true, error: undefined});
      try {
        const response = await getPurchaseShippingGuides(params);
        const meta = response.meta;
        set({ guides: response.data, meta, isLoading: false });
      } catch (error) {
        set({ error: "Error al cargar las guías", isLoading: false });
        errorToast("Error al cargar las guías");
      }
    },

    // Fetch single guide by ID
    fetchGuide: async (id: number) => {
      set({ isFinding: true, error: undefined});
      try {
        const response = await findPurchaseShippingGuideById(id);
        set({ guide: response.data, isFinding: false });
      } catch (error) {
        set({ error: "Error al cargar la guía", isFinding: false });
        errorToast("Error al cargar la guía");
      }
    },

    // Create new guide
    createGuide: async (data: PurchaseShippingGuideSchema) => {
      set({ isSubmitting: true, error: undefined});
      try {
        const request: CreatePurchaseShippingGuideRequest = {
          purchase_id: data.purchase_id ? Number(data.purchase_id) : null,
          guide_number: data.guide_number,
          issue_date: data.issue_date,
          transfer_date: data.transfer_date,
          motive: data.motive,
          carrier_name: data.carrier_name,
          carrier_ruc: data.carrier_ruc,
          vehicle_plate: data.vehicle_plate,
          driver_name: data.driver_name,
          driver_license: data.driver_license,
          origin_address: data.origin_address,
          destination_address: data.destination_address,
          total_weight: Number(data.total_weight),
          observations: data.observations || "",
          status: data.status,
          details: data.details.map((detail) => ({
            product_id: Number(detail.product_id),
            quantity: Number(detail.quantity),
            unit: detail.unit,
          })),
        };

        await storePurchaseShippingGuide(request);
        set({ isSubmitting: false });
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
        errorToast(ERROR_MESSAGE(MODEL, "create"));
        throw error;
      }
    },

    // Update guide
    updateGuide: async (
      id: number,
      data: Partial<PurchaseShippingGuideUpdateSchema>
    ) => {
      set({ isSubmitting: true, error: undefined});
      try {
        const request: UpdatePurchaseShippingGuideRequest = {
          ...(data.purchase_id !== undefined && {
            purchase_id: data.purchase_id ? Number(data.purchase_id) : null,
          }),
          ...(data.guide_number && { guide_number: data.guide_number }),
          ...(data.issue_date && { issue_date: data.issue_date }),
          ...(data.transfer_date && { transfer_date: data.transfer_date }),
          ...(data.motive && { motive: data.motive }),
          ...(data.carrier_name && { carrier_name: data.carrier_name }),
          ...(data.carrier_ruc && { carrier_ruc: data.carrier_ruc }),
          ...(data.vehicle_plate && { vehicle_plate: data.vehicle_plate }),
          ...(data.driver_name && { driver_name: data.driver_name }),
          ...(data.driver_license && { driver_license: data.driver_license }),
          ...(data.origin_address && { origin_address: data.origin_address }),
          ...(data.destination_address && {
            destination_address: data.destination_address,
          }),
          ...(data.total_weight && { total_weight: Number(data.total_weight) }),
          ...(data.observations !== undefined && {
            observations: data.observations,
          }),
          ...(data.status && { status: data.status }),
        };

        await updatePurchaseShippingGuide(id, request);
        set({ isSubmitting: false });
        successToast(SUCCESS_MESSAGE(MODEL, "edit"));
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
        errorToast(ERROR_MESSAGE(MODEL, "edit"));
        throw error;
      }
    },

    // Delete guide
    removeGuide: async (id: number) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await deletePurchaseShippingGuide(id);
        set({ isSubmitting: false });
        successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
        errorToast(ERROR_MESSAGE(MODEL, "delete"));
        throw error;
      }
    },

    // Assign purchase to guide
    assignPurchaseToGuide: async (id: number, purchaseId: number) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await assignPurchase(id, { purchase_id: purchaseId });
        set({ isSubmitting: false });
        successToast("Compra asignada correctamente");
      } catch (error) {
        set({ error: "Error al asignar la compra", isSubmitting: false });
        errorToast("Error al asignar la compra");
        throw error;
      }
    },

    // Reset guide state
    resetGuide: () => {
      set({ guide: null, error: undefined});
    },
  })
);
