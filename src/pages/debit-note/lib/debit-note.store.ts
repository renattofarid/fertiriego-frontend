import { create } from "zustand";
import {
  getDebitNoteById,
  getDebitNotes,
  createDebitNote,
  updateDebitNote,
  getDebitNoteReasons,
} from "./debit-note.actions";
import type { DebitNoteSchema } from "./debit-note.schema";
import type { Meta } from "@/lib/pagination.interface";
import type {
  DebitNoteReason,
  DebitNoteResource,
} from "./debit-note.interface";

interface DebitNoteStore {
  allDebitNotes: DebitNoteResource[] | null;
  debitNotes: DebitNoteResource[] | null;
  debitNote: DebitNoteResource | null;
  allDebitNoteReasons?: DebitNoteReason[];
  meta?: Meta;
  isLoadingAll: boolean;
  isLoadingAllReasons: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllDebitNotes: () => Promise<void>;
  fetchDebitNotes: (params?: Record<string, any>) => Promise<void>;
  fetchDebitNote: (id: number) => Promise<void>;
  fetchAllDebitNoteReasons: () => Promise<void>;
  createDebitNote: (data: DebitNoteSchema) => Promise<void>;
  updateDebitNote: (id: number, data: DebitNoteSchema) => Promise<void>;
}

export const useDebitNoteStore = create<DebitNoteStore>((set) => ({
  allDebitNotes: null,
  debitNote: null,
  debitNotes: null,
  allDebitNoteReasons: [],
  meta: undefined,
  isLoadingAll: false,
  isLoadingAllReasons: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchDebitNotes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined });
    try {
      const { data, meta } = await getDebitNotes({ params });
      set({ debitNotes: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar notas de crédito", isLoading: false });
    }
  },

  fetchAllDebitNotes: async () => {
    set({ isLoadingAll: true, error: undefined });
    try {
      const { data } = await getDebitNotes();
      set({ allDebitNotes: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar notas de crédito", isLoadingAll: false });
    }
  },

  fetchDebitNote: async (id: number) => {
    set({ isFinding: true, error: undefined });
    try {
      const { data } = await getDebitNoteById(id);
      set({ debitNote: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la nota de crédito", isFinding: false });
    }
  },

  fetchAllDebitNoteReasons: async (params?: Record<string, any>) => {
    set({ isLoadingAllReasons: true, error: undefined });
    try {
      const data = await getDebitNoteReasons(params);
      set({ allDebitNoteReasons: data, isLoadingAllReasons: false });
    } catch (err) {
      set({
        error: "Error al cargar la nota de crédito",
        isLoadingAllReasons: false,
      });
    }
  },

  createDebitNote: async (data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await createDebitNote(data);
    } catch (err) {
      set({ error: "Error al crear la Nota de Crédito" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateDebitNote: async (id: number, data: DebitNoteSchema) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await updateDebitNote(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Nota de Crédito" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
