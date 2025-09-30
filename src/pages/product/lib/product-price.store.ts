import { create } from "zustand";
import {
  getProductPrices,
  getProductPriceById,
  createProductPrice,
  updateProductPrice,
  deleteProductPrice,
} from "./product.actions";
import type {
  ProductPriceResource,
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
  GetProductPricesProps,
} from "./product.interface";
import type { Meta } from "@/lib/pagination.interface";

interface ProductPriceStore {
  productPrices: ProductPriceResource[] | null;
  productPrice: ProductPriceResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchProductPrices: (params: GetProductPricesProps) => Promise<void>;
  fetchProductPriceById: (id: number) => Promise<void>;
  createProductPrice: (data: CreateProductPriceRequest) => Promise<void>;
  updateProductPrice: (id: number, data: UpdateProductPriceRequest) => Promise<void>;
  deleteProductPrice: (id: number) => Promise<void>;
  clearState: () => void;
}

export const useProductPriceStore = create<ProductPriceStore>((set) => ({
  productPrices: null,
  productPrice: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchProductPrices: async (params: GetProductPricesProps) => {
    const state = useProductPriceStore.getState();
    if (state.isLoading) return; // Prevent duplicate calls

    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getProductPrices(params);
      set({ productPrices: data, meta: meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar los precios del producto", isLoading: false });
    }
  },

  fetchProductPriceById: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await getProductPriceById(id);
      set({ productPrice: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar el precio", isFinding: false });
    }
  },

  createProductPrice: async (data: CreateProductPriceRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await createProductPrice(data);
    } catch (err) {
      set({ error: "Error al crear el precio" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateProductPrice: async (id: number, data: UpdateProductPriceRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateProductPrice(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el precio" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteProductPrice: async (id: number) => {
    set({ error: null });
    try {
      await deleteProductPrice(id);
    } catch (err) {
      set({ error: "Error al eliminar el precio" });
      throw err;
    }
  },

  clearState: () => {
    set({
      productPrices: null,
      productPrice: null,
      meta: null,
      error: null,
    });
  },
}));