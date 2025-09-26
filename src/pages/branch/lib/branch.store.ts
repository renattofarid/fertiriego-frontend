import { create } from "zustand";
import {
  findBranchById,
  getAllBranches,
  getBranch,
  storeBranch,
  updateBranch,
} from "./branch.actions";
import type { BranchSchema } from "./branch.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { BranchResource } from "./branch.interface";

interface BranchStore {
  allBranches: BranchResource[] | null;
  branches: BranchResource[] | null;
  branch: BranchResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllBranches: () => Promise<void>;
  fetchBranches: (params?: Record<string, any>) => Promise<void>;
  fetchBranch: (id: number) => Promise<void>;
  createBranch: (data: BranchSchema) => Promise<void>;
  updateBranch: (id: number, data: BranchSchema) => Promise<void>;
}

export const useBranchStore = create<BranchStore>((set) => ({
  allBranches: null,
  branch: null,
  branches: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchBranches: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getBranch({ params });
      set({ branches: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar sucursales", isLoading: false });
    }
  },

  fetchAllBranches: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllBranches();
      set({ allBranches: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar sucursales", isLoadingAll: false });
    }
  },

  fetchBranch: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findBranchById(id);
      set({ branch: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la sucursal", isFinding: false });
    }
  },

  createBranch: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeBranch(data);
    } catch (err) {
      set({ error: "Error al crear la Sucursal" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateBranch: async (id: number, data: BranchSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateBranch(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Sucursal" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));