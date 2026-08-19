import { create } from "zustand";
import type { RowSelectionState, Updater } from "@tanstack/react-table";

interface ProductSelectionStore {
  rowSelection: RowSelectionState;
  selectedProductIds: number[];
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  clearSelection: () => void;
}

export const useProductSelectionStore = create<ProductSelectionStore>(
  (set, get) => ({
    rowSelection: {},
    selectedProductIds: [],

    setRowSelection: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(get().rowSelection)
          : updater;

      set({
        rowSelection: next,
        selectedProductIds: Object.keys(next)
          .filter((id) => next[id])
          .map(Number),
      });
    },

    clearSelection: () => set({ rowSelection: {}, selectedProductIds: [] }),
  }),
);
