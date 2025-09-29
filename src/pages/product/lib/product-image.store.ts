import { create } from "zustand";
import {
  getProductImages,
  getProductImageById,
  createProductImage,
  deleteProductImage,
} from "./product.actions";
import type {
  ProductImageResource,
  CreateProductImageRequest,
  GetProductImagesProps,
} from "./product.interface";
import type { Meta } from "@/lib/pagination.interface";

interface ProductImageStore {
  productImages: ProductImageResource[] | null;
  productImage: ProductImageResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchProductImages: (params: GetProductImagesProps) => Promise<void>;
  fetchProductImageById: (id: number) => Promise<void>;
  createProductImage: (data: CreateProductImageRequest) => Promise<void>;
  deleteProductImage: (id: number) => Promise<void>;
}

export const useProductImageStore = create<ProductImageStore>((set) => ({
  productImages: null,
  productImage: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchProductImages: async (params: GetProductImagesProps) => {
    const state = useProductImageStore.getState();
    if (state.isLoading) return; // Prevent duplicate calls

    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getProductImages(params);
      set({ productImages: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar las imágenes del producto", isLoading: false });
    }
  },

  fetchProductImageById: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await getProductImageById(id);
      set({ productImage: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la imagen", isFinding: false });
    }
  },

  createProductImage: async (data: CreateProductImageRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await createProductImage(data);
    } catch (err) {
      set({ error: "Error al subir las imágenes" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteProductImage: async (id: number) => {
    set({ error: null });
    try {
      await deleteProductImage(id);
    } catch (err) {
      set({ error: "Error al eliminar la imagen" });
      throw err;
    }
  },
}));