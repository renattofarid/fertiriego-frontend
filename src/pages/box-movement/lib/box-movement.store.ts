import { create } from "zustand";
import {
  getBoxMovements,
  findBoxMovementById,
  storeBoxMovement,
  deleteBoxMovement,
} from "./box-movement.actions";
import type { Meta } from "@/lib/pagination.interface";
import type { BoxMovementResource, CreateBoxMovementProps } from "./box-movement.interface";

interface BoxMovementStore {
  boxMovements: BoxMovementResource[] | null;
  boxMovement: BoxMovementResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchBoxMovements: (params?: Record<string, any>) => Promise<void>;
  fetchBoxMovement: (id: number) => Promise<void>;
  createBoxMovement: (data: CreateBoxMovementProps) => Promise<BoxMovementResource>;
  deleteBoxMovement: (id: number) => Promise<void>;
  clearBoxMovement: () => void;
}

export const useBoxMovementStore = create<BoxMovementStore>((set) => ({
  boxMovements: null,
  boxMovement: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchBoxMovements: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getBoxMovements({ params });
      set({ boxMovements: data, meta, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error al cargar movimientos de caja", isLoading: false });
    }
  },

  fetchBoxMovement: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findBoxMovementById(id);
      set({ boxMovement: data, isFinding: false });
    } catch (err: any) {
      set({ error: err.message || "Error al cargar el movimiento de caja", isFinding: false });
    }
  },

  createBoxMovement: async (data: CreateBoxMovementProps) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await storeBoxMovement(data);
      set({ isSubmitting: false });
      return response.data;
    } catch (err: any) {
      set({ error: err.message || "Error al crear movimiento de caja", isSubmitting: false });
      throw err;
    }
  },

  deleteBoxMovement: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteBoxMovement(id);
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ error: err.message || "Error al eliminar movimiento de caja", isSubmitting: false });
      throw err;
    }
  },

  clearBoxMovement: () => set({ boxMovement: null }),
}));
