import { create } from "zustand";
import type {
  GuideResource,
  GuideMotiveResource,
  CreateGuideRequest,
  UpdateGuideRequest,
} from "./guide.interface";
import {
  getGuides,
  getAllGuides,
  findGuideById,
  storeGuide,
  updateGuide,
  deleteGuide,
  getGuideMotives,
  changeGuideStatus,
  type GetGuidesParams,
} from "./guide.actions";
import type { GuideSchema } from "./guide.schema";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { GUIDE } from "./guide.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = GUIDE;

interface GuideStore {
  // State
  allGuides: GuideResource[] | null;
  guides: GuideResource[] | null;
  guide: GuideResource | null;
  motives: GuideMotiveResource[] | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  isLoadingMotives: boolean;
  error: string | null;

  // Actions
  fetchAllGuides: () => Promise<void>;
  fetchGuides: (params?: GetGuidesParams) => Promise<void>;
  fetchGuide: (id: number) => Promise<void>;
  fetchMotives: () => Promise<void>;
  createGuide: (data: GuideSchema) => Promise<void>;
  updateGuide: (id: number, data: Partial<GuideSchema>) => Promise<void>;
  removeGuide: (id: number) => Promise<void>;
  changeStatus: (id: number, status: string) => Promise<void>;
  resetGuide: () => void;
}

export const useGuideStore = create<GuideStore>((set) => ({
  // Initial state
  allGuides: null,
  guides: null,
  guide: null,
  motives: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  isLoadingMotives: false,
  error: null,

  // Fetch all guides (no pagination)
  fetchAllGuides: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllGuides();
      set({ allGuides: data, isLoadingAll: false });
    } catch (error) {
      set({ error: "Error al cargar las guías", isLoadingAll: false });
      errorToast("Error al cargar las guías");
    }
  },

  // Fetch guides with pagination
  fetchGuides: async (params?: GetGuidesParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getGuides(params);
      const meta = response.meta;
      set({ guides: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar las guías", isLoading: false });
      errorToast("Error al cargar las guías");
    }
  },

  // Fetch single guide by ID
  fetchGuide: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await findGuideById(id);
      set({ guide: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar la guía", isFinding: false });
      errorToast("Error al cargar la guía");
    }
  },

  // Fetch guide motives
  fetchMotives: async () => {
    set({ isLoadingMotives: true, error: null });
    try {
      const response = await getGuideMotives();
      set({ motives: response.data, isLoadingMotives: false });
    } catch (error) {
      set({
        error: "Error al cargar los motivos de traslado",
        isLoadingMotives: false,
      });
      errorToast("Error al cargar los motivos de traslado");
    }
  },

  // Create new guide
  createGuide: async (data: GuideSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreateGuideRequest = {
        warehouse_id: Number(data.warehouse_id),
        issue_date: data.issue_date,
        transfer_date: data.transfer_date,
        motive_id: Number(data.motive_id),
        sale_id: data.sale_id ? Number(data.sale_id) : null,
        purchase_id: data.purchase_id ? Number(data.purchase_id) : null,
        warehouse_document_id: data.warehouse_document_id
          ? Number(data.warehouse_document_id)
          : null,
        order_id: data.order_id ? Number(data.order_id) : null,
        transport_modality: data.transport_modality,
        // Transportista, conductor, vehículo y licencia siempre requeridos
        carrier_id: Number(data.carrier_id),
        driver_id: Number(data.driver_id),
        vehicle_id: Number(data.vehicle_id),
        driver_license: data.driver_license,
        // Campos adicionales solo para transporte privado
        secondary_vehicle_id:
          data.transport_modality === "PRIVADO" && data.secondary_vehicle_id
            ? Number(data.secondary_vehicle_id)
            : null,
        vehicle_plate:
          data.transport_modality === "PRIVADO" ? data.vehicle_plate : undefined,
        vehicle_brand:
          data.transport_modality === "PRIVADO" ? data.vehicle_brand : undefined,
        vehicle_model:
          data.transport_modality === "PRIVADO" ? data.vehicle_model : undefined,
        vehicle_mtc:
          data.transport_modality === "PRIVADO" ? data.vehicle_mtc : undefined,
        // Personas
        remittent_id: Number(data.remittent_id),
        shipping_guide_remittent_id: data.shipping_guide_remittent_id
          ? Number(data.shipping_guide_remittent_id)
          : null,
        dispatcher_id: data.dispatcher_id ? Number(data.dispatcher_id) : null,
        origin_address: data.origin_address,
        origin_ubigeo_id: Number(data.origin_ubigeo_id),
        destination_address: data.destination_address,
        destination_ubigeo_id: Number(data.destination_ubigeo_id),
        destination_warehouse_id: data.destination_warehouse_id
          ? Number(data.destination_warehouse_id)
          : null,
        recipient_id: data.recipient_id ? Number(data.recipient_id) : null,
        observations: data.observations || "",
        details: data.details.map((detail) => ({
          product_id: Number(detail.product_id),
          description: detail.description,
          quantity: Number(detail.quantity),
          unit_measure: detail.unit_measure,
          weight: Number(detail.weight),
        })),
      };

      await storeGuide(request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update guide
  updateGuide: async (id: number, data: Partial<GuideSchema>) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: UpdateGuideRequest = {
        ...(data.warehouse_id && { warehouse_id: Number(data.warehouse_id) }),
        ...(data.issue_date && { issue_date: data.issue_date }),
        ...(data.transfer_date && { transfer_date: data.transfer_date }),
        ...(data.motive_id && { motive_id: Number(data.motive_id) }),
        ...(data.sale_id !== undefined && {
          sale_id: data.sale_id ? Number(data.sale_id) : null,
        }),
        ...(data.purchase_id !== undefined && {
          purchase_id: data.purchase_id ? Number(data.purchase_id) : null,
        }),
        ...(data.warehouse_document_id !== undefined && {
          warehouse_document_id: data.warehouse_document_id
            ? Number(data.warehouse_document_id)
            : null,
        }),
        ...(data.order_id !== undefined && {
          order_id: data.order_id ? Number(data.order_id) : null,
        }),
        ...(data.transport_modality && {
          transport_modality: data.transport_modality,
        }),
        ...(data.carrier_id !== undefined && {
          carrier_id: Number(data.carrier_id),
        }),
        ...(data.driver_id !== undefined && {
          driver_id: Number(data.driver_id),
        }),
        ...(data.vehicle_id !== undefined && {
          vehicle_id: Number(data.vehicle_id),
        }),
        ...(data.secondary_vehicle_id !== undefined && {
          secondary_vehicle_id: data.secondary_vehicle_id
            ? Number(data.secondary_vehicle_id)
            : null,
        }),
        ...(data.vehicle_plate !== undefined && {
          vehicle_plate: data.vehicle_plate,
        }),
        ...(data.vehicle_brand !== undefined && {
          vehicle_brand: data.vehicle_brand,
        }),
        ...(data.vehicle_model !== undefined && {
          vehicle_model: data.vehicle_model,
        }),
        ...(data.vehicle_mtc !== undefined && {
          vehicle_mtc: data.vehicle_mtc,
        }),
        ...(data.driver_license !== undefined && {
          driver_license: data.driver_license,
        }),
        ...(data.remittent_id !== undefined && {
          remittent_id: Number(data.remittent_id),
        }),
        ...(data.shipping_guide_remittent_id !== undefined && {
          shipping_guide_remittent_id: data.shipping_guide_remittent_id
            ? Number(data.shipping_guide_remittent_id)
            : null,
        }),
        ...(data.dispatcher_id !== undefined && {
          dispatcher_id: data.dispatcher_id ? Number(data.dispatcher_id) : null,
        }),
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
        ...(data.destination_warehouse_id !== undefined && {
          destination_warehouse_id: data.destination_warehouse_id
            ? Number(data.destination_warehouse_id)
            : null,
        }),
        ...(data.recipient_id !== undefined && {
          recipient_id: data.recipient_id ? Number(data.recipient_id) : null,
        }),
        ...(data.observations !== undefined && {
          observations: data.observations || "",
        }),
        ...(data.details && {
          details: data.details.map((detail) => ({
            product_id: Number(detail.product_id),
            description: detail.description,
            quantity: Number(detail.quantity),
            unit_measure: detail.unit_measure,
            weight: Number(detail.weight),
          })),
        }),
      };

      await updateGuide(id, request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "edit"), isSubmitting: false });
      throw error;
    }
  },

  // Delete guide
  removeGuide: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteGuide(id);
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
      await changeGuideStatus(id, { status });
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
}));
