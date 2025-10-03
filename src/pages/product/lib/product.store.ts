import { create } from "zustand";
import {
  findProductById,
  getAllProducts,
  getProduct,
  storeProduct,
  updateProduct,
  deleteTechnicalSheet,
} from "./product.actions";
import type { ProductSchema } from "./product.schema";
import type { Meta } from "@/lib/pagination.interface";
import type {
  ProductResource,
  DeleteTechnicalSheetRequest,
} from "./product.interface";

interface ProductStore {
  allProducts: ProductResource[] | null;
  products: ProductResource[] | null;
  product: ProductResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllProducts: () => Promise<void>;
  fetchProducts: (params?: Record<string, any>) => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  createProduct: (data: ProductSchema) => Promise<void>;
  updateProduct: (id: number, data: ProductSchema) => Promise<void>;
  deleteTechnicalSheet: (
    productId: number,
    request: DeleteTechnicalSheetRequest
  ) => Promise<void>;
}

// Helper function to create FormData from ProductSchema
const createFormData = (data: ProductSchema): FormData => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("category_id", data.category_id?.toString());
  formData.append("brand_id", data.brand_id?.toString());
  formData.append("unit_id", data.unit_id?.toString());
  formData.append("product_type_id", data.product_type_id?.toString());

  // Append technical sheet files
  if (data.technical_sheet && data.technical_sheet.length > 0) {
    data.technical_sheet.forEach((file, index) => {
      formData.append(`technical_sheet[${index}]`, file);
    });
  }

  return formData;
};

export const useProductStore = create<ProductStore>((set) => ({
  allProducts: null,
  product: null,
  products: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchProducts: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getProduct({ params });
      set({ products: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar productos", isLoading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllProducts();
      set({ allProducts: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar productos", isLoadingAll: false });
    }
  },

  fetchProduct: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findProductById(id);
      set({ product: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el producto", isFinding: false });
    }
  },

  createProduct: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = createFormData(data);
      await storeProduct(formData);
    } catch (err) {
      set({ error: "Error al crear el Producto" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateProduct: async (id: number, data: ProductSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = createFormData(data);
      await updateProduct(id, formData);
    } catch (err) {
      set({ error: "Error al actualizar el Producto" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteTechnicalSheet: async (
    productId: number,
    request: DeleteTechnicalSheetRequest
  ) => {
    set({ error: null });
    try {
      await deleteTechnicalSheet(productId, request);
    } catch (err) {
      set({ error: "Error al eliminar la ficha técnica" });
      throw err;
    }
  },
}));
