import { create } from "zustand";
import type {
  ShippingGuideCarrierResource,
  CreateShippingGuideCarrierRequest,
  UpdateShippingGuideCarrierRequest,
} from "./shipping-guide-carrier.interface";
import {
  getShippingGuideCarriers,
  getAllShippingGuideCarriers,
  findShippingGuideCarrierById,
  storeShippingGuideCarrier,
  updateShippingGuideCarrier,
  deleteShippingGuideCarrier,
  changeShippingGuideCarrierStatus,
  type GetShippingGuideCarriersParams,
} from "./shipping-guide-carrier.actions";
import type { ShippingGuideCarrierSchema } from "./shipping-guide-carrier.schema";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { SHIPPING_GUIDE_CARRIER } from "./shipping-guide-carrier.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = SHIPPING_GUIDE_CARRIER;

interface ShippingGuideCarrierStore {
  // State
  allGuides: ShippingGuideCarrierResource[] | null;
  guides: ShippingGuideCarrierResource[] | null;
  guide: ShippingGuideCarrierResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchAllGuides: () => Promise<void>;
  fetchGuides: (params?: GetShippingGuideCarriersParams) => Promise<void>;
  fetchGuide: (id: number) => Promise<void>;
  createGuide: (data: ShippingGuideCarrierSchema) => Promise<void>;
  updateGuide: (
    id: number,
    data: Partial<ShippingGuideCarrierSchema>
  ) => Promise<void>;
  removeGuide: (id: number) => Promise<void>;
  changeStatus: (id: number, status: string) => Promise<void>;
  resetGuide: () => void;
}

export const useShippingGuideCarrierStore = create<ShippingGuideCarrierStore>(
  (set) => ({
    // Initial state
    allGuides: null,
    guides: null,
    guide: null,
    meta: null,
    isLoadingAll: false,
    isLoading: false,
    isFinding: false,
    isSubmitting: false,
    error: null,

    // Fetch all guides (no pagination)
    fetchAllGuides: async () => {
      set({ isLoadingAll: true, error: null });
      try {
        const data = await getAllShippingGuideCarriers();
        set({ allGuides: data, isLoadingAll: false });
      } catch (error) {
        set({
          error: "Error al cargar las guías de transportista",
          isLoadingAll: false,
        });
        errorToast("Error al cargar las guías de transportista");
      }
    },

    // Fetch guides with pagination
    fetchGuides: async (params?: GetShippingGuideCarriersParams) => {
      set({ isLoading: true, error: null });
      try {
        const response = await getShippingGuideCarriers(params);
        const meta = response.meta;
        set({ guides: response.data, meta, isLoading: false });
      } catch (error) {
        set({
          error: "Error al cargar las guías de transportista",
          isLoading: false,
        });
        errorToast("Error al cargar las guías de transportista");
      }
    },

    // Fetch single guide by ID
    fetchGuide: async (id: number) => {
      set({ isFinding: true, error: null });
      try {
        const response = await findShippingGuideCarrierById(id);
        set({ guide: response.data, isFinding: false });
      } catch (error) {
        set({
          error: "Error al cargar la guía de transportista",
          isFinding: false,
        });
        errorToast("Error al cargar la guía de transportista");
      }
    },

    // Create new guide
    createGuide: async (data: ShippingGuideCarrierSchema) => {
      set({ isSubmitting: true, error: null });
      try {
        const request: CreateShippingGuideCarrierRequest = {
          carrier_id: Number(data.carrier_id),
          issue_date: data.issue_date,
          transfer_start_date: data.transfer_start_date,
          remittent_id: Number(data.remittent_id),
          recipient_id: data.recipient_id
            ? Number(data.recipient_id)
            : undefined,
          driver_id: Number(data.driver_id),
          vehicle_id: Number(data.vehicle_id),
          secondary_vehicle_id: data.secondary_vehicle_id
            ? Number(data.secondary_vehicle_id)
            : undefined,
          driver_license: data.driver_license,
          origin_address: data.origin_address,
          origin_ubigeo_id: Number(data.origin_ubigeo_id),
          destination_address: data.destination_address,
          destination_ubigeo_id: Number(data.destination_ubigeo_id),
          observations: data.observations || "",
          details: data.details.map((detail) => ({
            product_id: Number(detail.product_id),
            description: detail.description,
            quantity: Number(detail.quantity),
            unit: detail.unit,
            weight: Number(detail.weight),
          })),
        };

        await storeShippingGuideCarrier(request);
        set({ isSubmitting: false });
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
        throw error;
      }
    },

    // Update guide
    updateGuide: async (
      id: number,
      data: Partial<ShippingGuideCarrierSchema>
    ) => {
      set({ isSubmitting: true, error: null });
      try {
        const request: UpdateShippingGuideCarrierRequest = {
          ...(data.carrier_id && { carrier_id: Number(data.carrier_id) }),
          ...(data.issue_date && { issue_date: data.issue_date }),
          ...(data.transfer_start_date && {
            transfer_start_date: data.transfer_start_date,
          }),
          ...(data.remittent_id && { remittent_id: Number(data.remittent_id) }),
          ...(data.recipient_id !== undefined && {
            recipient_id: data.recipient_id
              ? Number(data.recipient_id)
              : undefined,
          }),
          ...(data.driver_id && { driver_id: Number(data.driver_id) }),
          ...(data.vehicle_id && { vehicle_id: Number(data.vehicle_id) }),
          ...(data.secondary_vehicle_id !== undefined && {
            secondary_vehicle_id: data.secondary_vehicle_id
              ? Number(data.secondary_vehicle_id)
              : undefined,
          }),
          ...(data.driver_license && { driver_license: data.driver_license }),
          ...(data.origin_address && { origin_address: data.origin_address }),
          ...(data.origin_ubigeo_id && {
            origin_ubigeo_id: Number(data.origin_ubigeo_id),
          }),
          ...(data.destination_address && {
            destination_address: data.destination_address,
          }),
          ...(data.destination_ubigeo_id && {
            destination_ubigeo_id: Number(data.destination_ubigeo_id),
          }),
          ...(data.observations !== undefined && {
            observations: data.observations || "",
          }),
          ...(data.details && {
            details: data.details.map((detail) => ({
              product_id: Number(detail.product_id),
              description: detail.description,
              quantity: Number(detail.quantity),
              unit: detail.unit,
              weight: Number(detail.weight),
            })),
          }),
        };

        await updateShippingGuideCarrier(id, request);
        set({ isSubmitting: false });
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
        throw error;
      }
    },

    // Delete guide
    removeGuide: async (id: number) => {
      set({ isSubmitting: true, error: null });
      try {
        await deleteShippingGuideCarrier(id);
        set({ isSubmitting: false });
      } catch (error) {
        set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
        throw error;
      }
    },

    // Change guide status
    changeStatus: async (id: number, status: string) => {
      set({ isSubmitting: true, error: null });
      try {
        await changeShippingGuideCarrierStatus(id, { status });
        set({ isSubmitting: false });
      } catch (error) {
        set({ error: "Error al cambiar el estado", isSubmitting: false });
        throw error;
      }
    },

    // Reset guide state
    resetGuide: () => {
      set({ guide: null, error: null });
    },
  })
);
