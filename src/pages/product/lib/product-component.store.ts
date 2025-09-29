import { create } from "zustand";
import {
  getProductComponents,
  getProductComponentById,
  createProductComponent,
  updateProductComponent,
  deleteProductComponent,
} from "./product.actions";
import type {
  ProductComponentResource,
  CreateProductComponentRequest,
  UpdateProductComponentRequest,
  GetProductComponentsProps,
} from "./product.interface";
import type { Meta } from "@/lib/pagination.interface";

interface ProductComponentStore {
  productComponents: ProductComponentResource[] | null;
  productComponent: ProductComponentResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchProductComponents: (params: GetProductComponentsProps) => Promise<void>;
  fetchProductComponentById: (id: number) => Promise<void>;
  createProductComponent: (data: CreateProductComponentRequest) => Promise<void>;
  updateProductComponent: (id: number, data: UpdateProductComponentRequest) => Promise<void>;
  deleteProductComponent: (id: number) => Promise<void>;
  clearState: () => void;
}

export const useProductComponentStore = create<ProductComponentStore>((set) => ({
  productComponents: null,
  productComponent: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchProductComponents: async (params: GetProductComponentsProps) => {
    const state = useProductComponentStore.getState();
    if (state.isLoading) return; // Prevent duplicate calls

    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getProductComponents(params);
      set({ productComponents: data, meta: meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar los componentes del producto", isLoading: false });
    }
  },

  fetchProductComponentById: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await getProductComponentById(id);
      set({ productComponent: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar el componente", isFinding: false });
    }
  },

  createProductComponent: async (data: CreateProductComponentRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await createProductComponent(data);
    } catch (err) {
      set({ error: "Error al crear el componente" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateProductComponent: async (id: number, data: UpdateProductComponentRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateProductComponent(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el componente" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteProductComponent: async (id: number) => {
    set({ error: null });
    try {
      await deleteProductComponent(id);
    } catch (err) {
      set({ error: "Error al eliminar el componente" });
      throw err;
    }
  },

  clearState: () => {
    set({
      productComponents: null,
      productComponent: null,
      meta: null,
      error: null,
    });
  },
}));