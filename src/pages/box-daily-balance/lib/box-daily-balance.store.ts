import { create } from "zustand";
import { getBoxDailyBalances, createBoxDailyBalance } from "./box-daily-balance.actions";
import type { Meta } from "@/lib/pagination.interface";
import type { BoxDailyBalanceResource, CreateBoxDailyBalanceProps } from "./box-daily-balance.interface";

interface BoxDailyBalanceStore {
  balances: BoxDailyBalanceResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchBalances: (params?: Record<string, any>) => Promise<void>;
  createBalance: (data: CreateBoxDailyBalanceProps) => Promise<BoxDailyBalanceResource>;
}

export const useBoxDailyBalanceStore = create<BoxDailyBalanceStore>((set) => ({
  balances: null,
  meta: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchBalances: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getBoxDailyBalances({ params });
      set({ balances: data, meta, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error al cargar balances diarios", isLoading: false });
    }
  },

  createBalance: async (data: CreateBoxDailyBalanceProps) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await createBoxDailyBalance(data);
      set({ isSubmitting: false });
      return response.data;
    } catch (err: any) {
      set({ error: err.message || "Error al crear balance diario", isSubmitting: false });
      throw err;
    }
  },
}));
