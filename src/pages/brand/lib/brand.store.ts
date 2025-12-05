import { create } from "zustand";
import {
  findBrandById,
  getAllBrands,
  getBrand,
  storeBrand,
  updateBrand,
} from "./brand.actions";
import type { BrandSchema } from "./brand.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { BrandResource } from "./brand.interface";

interface BrandStore {
  allBrands: BrandResource[] | null;
  brands: BrandResource[] | null;
  brand: BrandResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllBrands: () => Promise<void>;
  fetchBrands: (params?: Record<string, any>) => Promise<void>;
  fetchBrand: (id: number) => Promise<void>;
  createBrand: (data: BrandSchema) => Promise<void>;
  updateBrand: (id: number, data: BrandSchema) => Promise<void>;
}

export const useBrandStore = create<BrandStore>((set) => ({
  allBrands: null,
  brand: null,
  brands: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchBrands: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getBrand({ params });
      set({ brands: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar marcas", isLoading: false });
    }
  },

  fetchAllBrands: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const data = await getAllBrands();
      set({ allBrands: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar marcas", isLoadingAll: false });
    }
  },

  fetchBrand: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findBrandById(id);
      set({ brand: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la marca", isFinding: false });
    }
  },

  createBrand: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await storeBrand(data);
    } catch (err) {
      set({ error: "Error al crear la Marca" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateBrand: async (id: number, data: BrandSchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateBrand(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Marca" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));