import { create } from "zustand";
import {
  findWarehouseProductById,
  getAllWarehouseProducts,
  getWarehouseProduct,
  storeWarehouseProduct,
  updateWarehouseProduct,
} from "./warehouse-product.actions";
import type { WarehouseProductSchema } from "./warehouse-product.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { WarehouseProductResource } from "./warehouse-product.interface";

interface WarehouseProductStore {
  allWarehouseProducts: WarehouseProductResource[] | null;
  warehouseProducts: WarehouseProductResource[] | null;
  warehouseProduct: WarehouseProductResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllWarehouseProducts: (params?: Record<string, any>) => Promise<void>;
  fetchWarehouseProducts: (params?: Record<string, any>) => Promise<void>;
  fetchWarehouseProduct: (id: number) => Promise<void>;
  createWarehouseProduct: (data: WarehouseProductSchema) => Promise<void>;
  updateWarehouseProduct: (
    id: number,
    data: WarehouseProductSchema
  ) => Promise<void>;
}

export const useWarehouseProductStore = create<WarehouseProductStore>(
  (set) => ({
    allWarehouseProducts: null,
    warehouseProduct: null,
    warehouseProducts: null,
    meta: undefined,
    isLoadingAll: false,
    isLoading: false,
    isFinding: false,
    isSubmitting: false,
    error: undefined,

    fetchWarehouseProducts: async (params?: Record<string, any>) => {
      set({ isLoading: true, error: undefined});
      try {
        const { data, meta } = await getWarehouseProduct({ params });
        set({ warehouseProducts: data, meta: meta, isLoading: false });
      } catch (err) {
        set({
          error: "Error al cargar productos en almacén",
          isLoading: false,
        });
      }
    },

    fetchAllWarehouseProducts: async (params?: Record<string, any>) => {
      set({ isLoadingAll: true, error: undefined});
      try {
        const data = await getAllWarehouseProducts(params);
        set({ allWarehouseProducts: data, isLoadingAll: false });
      } catch (err) {
        set({
          error: "Error al cargar productos en almacén",
          isLoadingAll: false,
        });
      }
    },

    fetchWarehouseProduct: async (id: number) => {
      set({ isFinding: true, error: undefined});
      try {
        const { data } = await findWarehouseProductById(id);
        set({ warehouseProduct: data, isFinding: false });
      } catch (err) {
        set({
          error: "Error al cargar el producto de almacén",
          isFinding: false,
        });
      }
    },

    createWarehouseProduct: async (data) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await storeWarehouseProduct(data);
      } catch (err) {
        set({ error: "Error al crear el producto de almacén" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateWarehouseProduct: async (
      id: number,
      data: WarehouseProductSchema
    ) => {
      set({ isSubmitting: true, error: undefined});
      try {
        await updateWarehouseProduct(id, data);
      } catch (err) {
        set({ error: "Error al actualizar el producto de almacén" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },
  })
);
