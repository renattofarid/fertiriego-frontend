import { create } from "zustand";
import {
  getBoxShifts,
  findBoxShiftById,
  storeBoxShift,
  closeBoxShift,
  deleteBoxShift,
} from "./box-shift.actions";
import type { Meta } from "@/lib/pagination.interface";
import type {
  BoxShiftResource,
  CreateBoxShiftProps,
  CloseBoxShiftProps,
} from "./box-shift.interface";

interface BoxShiftStore {
  boxShifts: BoxShiftResource[] | null;
  boxShift: BoxShiftResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;

  fetchBoxShifts: (params?: Record<string, any>) => Promise<void>;
  fetchBoxShift: (id: number) => Promise<void>;
  createBoxShift: (data: CreateBoxShiftProps) => Promise<BoxShiftResource>;
  closeBoxShiftAction: (data: CloseBoxShiftProps) => Promise<BoxShiftResource>;
  deleteBoxShift: (id: number) => Promise<void>;
  clearBoxShift: () => void;
}

export const useBoxShiftStore = create<BoxShiftStore>((set) => ({
  boxShifts: null,
  boxShift: null,
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchBoxShifts: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getBoxShifts({ params });
      set({ boxShifts: data, meta, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Error al cargar caja chica",
        isLoading: false,
      });
    }
  },

  fetchBoxShift: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findBoxShiftById(id);
      set({ boxShift: data, isFinding: false });
    } catch (err: any) {
      set({
        error: err.message || "Error al cargar el turno de caja",
        isFinding: false,
      });
    }
  },

  createBoxShift: async (data: CreateBoxShiftProps) => {
    set({ isSubmitting: true, error: undefined});
    try {
      const response = await storeBoxShift(data);
      set({ isSubmitting: false });
      return response.data;
    } catch (err: any) {
      set({
        error: err.message || "Error al abrir turno de caja",
        isSubmitting: false,
      });
      throw err;
    }
  },

  closeBoxShiftAction: async (data: CloseBoxShiftProps) => {
    set({ isSubmitting: true, error: undefined});
    try {
      const response = await closeBoxShift(data);
      set({ isSubmitting: false });
      return response.data;
    } catch (err: any) {
      set({
        error: err.message || "Error al cerrar turno de caja",
        isSubmitting: false,
      });
      throw err;
    }
  },

  deleteBoxShift: async (id: number) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await deleteBoxShift(id);
      set({ isSubmitting: false });
    } catch (err: any) {
      set({
        error: err.message || "Error al eliminar turno de caja",
        isSubmitting: false,
      });
      throw err;
    }
  },

  clearBoxShift: () => set({ boxShift: null }),
}));
