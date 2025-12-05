import { create } from "zustand";
import {
  findCompanyById,
  getAllCompanies,
  getCompany,
  storeCompany,
  updateCompany,
} from "./company.actions";
import type { CompanySchema } from "./company.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { CompanyResource } from "./company.interface";

interface CompanyStore {
  allCompanies: CompanyResource[] | null;
  companies: CompanyResource[] | null;
  company: CompanyResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllCompanies: () => Promise<void>;
  fetchCompanies: (params?: Record<string, any>) => Promise<void>;
  fetchCompany: (id: number) => Promise<void>;
  createCompany: (data: CompanySchema) => Promise<void>;
  updateCompany: (id: number, data: CompanySchema) => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  allCompanies: null,
  company: null,
  companies: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchCompanies: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getCompany({ params });
      set({ companies: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar empresas", isLoading: false });
    }
  },

  fetchAllCompanies: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const data = await getAllCompanies();
      set({ allCompanies: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar empresas", isLoadingAll: false });
    }
  },

  fetchCompany: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findCompanyById(id);
      set({ company: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la empresa", isFinding: false });
    }
  },

  createCompany: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await storeCompany(data);
    } catch (err) {
      set({ error: "Error al crear la Empresa" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateCompany: async (id: number, data: CompanySchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateCompany(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Empresa" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));