import { create } from "zustand";
import {
  getCreditNoteById,
  getCreditNotes,
  createCreditNote,
  updateCreditNote,
} from "./credit-note.actions";
import type { CreditNoteSchema } from "./credit-note.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { CreditNoteResource } from "./credit-note.interface";

interface CreditNoteStore {
  allCreditNotes: CreditNoteResource[] | null;
  creditNotes: CreditNoteResource[] | null;
  creditNote: CreditNoteResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllCreditNotes: () => Promise<void>;
  fetchCreditNotes: (params?: Record<string, any>) => Promise<void>;
  fetchCreditNote: (id: number) => Promise<void>;
  createCreditNote: (data: CreditNoteSchema) => Promise<void>;
  updateCreditNote: (id: number, data: CreditNoteSchema) => Promise<void>;
}

export const useCreditNoteStore = create<CreditNoteStore>((set) => ({
  allCreditNotes: null,
  creditNote: null,
  creditNotes: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchCreditNotes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getCreditNotes({ params });
      set({ creditNotes: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar notas de crédito", isLoading: false });
    }
  },

  fetchAllCreditNotes: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const { data } = await getCreditNotes();
      set({ allCreditNotes: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar notas de crédito", isLoadingAll: false });
    }
  },

  fetchCreditNote: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await getCreditNoteById(id);
      set({ creditNote: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la nota de crédito", isFinding: false });
    }
  },

  createCreditNote: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await createCreditNote(data);
    } catch (err) {
      set({ error: "Error al crear la Nota de Crédito" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateCreditNote: async (id: number, data: CreditNoteSchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateCreditNote(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Nota de Crédito" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
