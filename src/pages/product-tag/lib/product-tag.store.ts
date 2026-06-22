import { create } from "zustand";
import {
  findTagById,
  getAllTags,
  storeTag,
  updateTag,
} from "./product-tag.actions";
import type { TagSchema } from "./product-tag.schema";
import type { TagResource } from "./product-tag.interface";

interface ProductTagStore {
  tag: TagResource | null;
  allTags: TagResource[] | null;
  isFinding: boolean;
  isLoadingAll: boolean;
  isSubmitting: boolean;
  error?: string;
  fetchTag: (id: number) => Promise<void>;
  fetchAllTags: () => Promise<void>;
  createTag: (data: TagSchema) => Promise<void>;
  updateTag: (id: number, data: Partial<TagSchema>) => Promise<void>;
}

export const useProductTagStore = create<ProductTagStore>((set) => ({
  tag: null,
  allTags: null,
  isFinding: false,
  isLoadingAll: false,
  isSubmitting: false,
  error: undefined,

  fetchTag: async (id: number) => {
    set({ isFinding: true, error: undefined });
    try {
      const { data } = await findTagById(id);
      set({ tag: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar la etiqueta", isFinding: false });
    }
  },

  fetchAllTags: async () => {
    set({ isLoadingAll: true, error: undefined });
    try {
      const data = await getAllTags();
      set({ allTags: data, isLoadingAll: false });
    } catch {
      set({ error: "Error al cargar las etiquetas", isLoadingAll: false });
    }
  },

  createTag: async (data: TagSchema) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await storeTag(data);
    } catch (err) {
      set({ error: "Error al crear la etiqueta" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateTag: async (id: number, data: Partial<TagSchema>) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await updateTag(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la etiqueta" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
