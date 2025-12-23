import { create } from "zustand";
import {
  getVehicleById,
  getVehicles,
  createVehicle,
  updateVehicle,
} from "./vehicle.actions";
import type { VehicleSchema } from "./vehicle.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { VehicleResource } from "./vehicle.interface";

interface VehicleStore {
  allVehicles: VehicleResource[] | null;
  vehicles: VehicleResource[] | null;
  vehicle: VehicleResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllVehicles: () => Promise<void>;
  fetchVehicles: (params?: Record<string, any>) => Promise<void>;
  fetchVehicle: (id: number) => Promise<void>;
  createVehicle: (data: VehicleSchema) => Promise<void>;
  updateVehicle: (id: number, data: VehicleSchema) => Promise<void>;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  allVehicles: null,
  vehicle: null,
  vehicles: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchVehicles: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getVehicles({ params });
      set({ vehicles: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar vehículos", isLoading: false });
    }
  },

  fetchAllVehicles: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const { data } = await getVehicles();
      set({ allVehicles: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar vehículos", isLoadingAll: false });
    }
  },

  fetchVehicle: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await getVehicleById(id);
      set({ vehicle: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el vehículo", isFinding: false });
    }
  },

  createVehicle: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await createVehicle(data);
    } catch (err) {
      set({ error: "Error al crear el Vehículo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateVehicle: async (id: number, data: VehicleSchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateVehicle(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Vehículo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
