import { create } from "zustand";
import {
  findProductPriceCategoryById,
  getAllProductPriceCategories,
  getProductPriceCategory,
  storeProductPriceCategory,
  updateProductPriceCategory,
} from "./product-price-category.actions";
import type { ProductPriceCategorySchema } from "./product-price-category.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { ProductPriceCategoryResource } from "./product-price-category.interface";

interface ProductPriceCategoryStore {
  allProductPriceCategories: ProductPriceCategoryResource[] | null;
  productPriceCategories: ProductPriceCategoryResource[] | null;
  productPriceCategory: ProductPriceCategoryResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllProductPriceCategories: () => Promise<void>;
  fetchProductPriceCategories: (params?: Record<string, any>) => Promise<void>;
  fetchProductPriceCategory: (id: number) => Promise<void>;
  createProductPriceCategory: (data: ProductPriceCategorySchema) => Promise<void>;
  updateProductPriceCategory: (id: number, data: ProductPriceCategorySchema) => Promise<void>;
}

export const useProductPriceCategoryStore = create<ProductPriceCategoryStore>((set) => ({
  allProductPriceCategories: null,
  productPriceCategory: null,
  productPriceCategories: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchProductPriceCategories: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getProductPriceCategory({ params });
      set({ productPriceCategories: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar categorías de precio", isLoading: false });
    }
  },

  fetchAllProductPriceCategories: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const data = await getAllProductPriceCategories();
      set({ allProductPriceCategories: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar categorías de precio", isLoadingAll: false });
    }
  },

  fetchProductPriceCategory: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findProductPriceCategoryById(id);
      set({ productPriceCategory: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la categoría de precio", isFinding: false });
    }
  },

  createProductPriceCategory: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await storeProductPriceCategory(data);
    } catch (err) {
      set({ error: "Error al crear la Categoría de Precio" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateProductPriceCategory: async (id: number, data: ProductPriceCategorySchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateProductPriceCategory(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Categoría de Precio" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
