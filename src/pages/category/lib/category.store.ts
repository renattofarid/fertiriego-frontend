import { create } from "zustand";
import {
  findCategoryById,
  getAllCategories,
  getCategory,
  storeCategory,
  updateCategory,
} from "./category.actions";
import type { CategorySchema } from "./category.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { CategoryResource } from "./category.interface";

interface CategoryStore {
  allCategories: CategoryResource[] | null;
  categories: CategoryResource[] | null;
  category: CategoryResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllCategories: () => Promise<void>;
  fetchCategories: (params?: Record<string, any>) => Promise<void>;
  fetchCategory: (id: number) => Promise<void>;
  createCategory: (data: CategorySchema) => Promise<void>;
  updateCategory: (id: number, data: CategorySchema) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  allCategories: null,
  category: null,
  categories: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchCategories: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getCategory({ params });
      set({ categories: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar categorías", isLoading: false });
    }
  },

  fetchAllCategories: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllCategories();
      set({ allCategories: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar categorías", isLoadingAll: false });
    }
  },

  fetchCategory: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findCategoryById(id);
      set({ category: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la categoría", isFinding: false });
    }
  },

  createCategory: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeCategory(data);
    } catch (err) {
      set({ error: "Error al crear la Categoría" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateCategory: async (id: number, data: CategorySchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateCategory(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Categoría" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));