import { create } from "zustand";
import {
  findProductTypeById,
  getAllProductTypes,
  getProductType,
  storeProductType,
  updateProductType,
} from "./product-type.actions";
import type { ProductTypeSchema } from "./product-type.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { ProductTypeResource } from "./product-type.interface";

interface ProductTypeStore {
  allProductTypes: ProductTypeResource[] | null;
  productTypes: ProductTypeResource[] | null;
  productType: ProductTypeResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllProductTypes: () => Promise<void>;
  fetchProductTypes: (params?: Record<string, any>) => Promise<void>;
  fetchProductType: (id: number) => Promise<void>;
  createProductType: (data: ProductTypeSchema) => Promise<void>;
  updateProductType: (id: number, data: ProductTypeSchema) => Promise<void>;
}

export const useProductTypeStore = create<ProductTypeStore>((set) => ({
  allProductTypes: null,
  productType: null,
  productTypes: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchProductTypes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getProductType({ params });
      set({ productTypes: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de producto", isLoading: false });
    }
  },

  fetchAllProductTypes: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllProductTypes();
      set({ allProductTypes: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de producto", isLoadingAll: false });
    }
  },

  fetchProductType: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findProductTypeById(id);
      set({ productType: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el tipo de producto", isFinding: false });
    }
  },

  createProductType: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeProductType(data);
    } catch (err) {
      set({ error: "Error al crear el Tipo de Producto" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateProductType: async (id: number, data: ProductTypeSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateProductType(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Tipo de Producto" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
