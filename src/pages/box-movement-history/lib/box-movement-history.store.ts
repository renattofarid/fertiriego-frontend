import { create } from "zustand";
import { getBoxMovementHistories, getHistoriesByMovement } from "./box-movement-history.actions";
import type { Meta } from "@/lib/pagination.interface";
import type { BoxMovementHistoryResource } from "./box-movement-history.interface";

interface BoxMovementHistoryStore {
  histories: BoxMovementHistoryResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  error: string | null;

  fetchHistories: (params?: Record<string, any>) => Promise<void>;
  fetchHistoriesByMovement: (box_movement_id: number) => Promise<void>;
}

export const useBoxMovementHistoryStore = create<BoxMovementHistoryStore>((set) => ({
  histories: null,
  meta: null,
  isLoading: false,
  error: null,

  fetchHistories: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getBoxMovementHistories({ params });
      set({ histories: data, meta, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error al cargar historiales", isLoading: false });
    }
  },

  fetchHistoriesByMovement: async (box_movement_id: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getHistoriesByMovement({ box_movement_id });
      set({ histories: data, meta, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error al cargar historiales del movimiento", isLoading: false });
    }
  },
}));
