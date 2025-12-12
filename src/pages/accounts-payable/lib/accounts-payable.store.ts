import { create } from "zustand";
import type { PurchaseInstallmentResource } from "./accounts-payable.interface";
import { getInstallments, getAllInstallments } from "./accounts-payable.actions";
import { errorToast } from "@/lib/core.function";
import type { Meta } from "@/lib/pagination.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

interface GetInstallmentsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

interface AccountsPayableStore {
  // State
  installments: PurchaseInstallmentResource[];
  allInstallments: PurchaseInstallmentResource[];
  meta?: Meta;
  isLoading: boolean;
  isLoadingAll: boolean;
  error?: string;

  // Pagination state
  page: number;
  per_page: number;
  search: string;

  // Actions
  fetchInstallments: (params?: GetInstallmentsParams) => Promise<void>;
  fetchAllInstallments: () => Promise<void>;
  setPage: (page: number) => void;
  setPerPage: (per_page: number) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

export const useAccountsPayableStore = create<AccountsPayableStore>(
  (set, get) => ({
    // Initial state
    installments: [],
    allInstallments: [],
    meta: undefined,
    isLoading: false,
    isLoadingAll: false,
    error: undefined,

    // Initial pagination state
    page: 1,
    per_page: DEFAULT_PER_PAGE,
    search: "",

    // Fetch installments with pagination
    fetchInstallments: async (params?: GetInstallmentsParams) => {
      set({ isLoading: true, error: undefined });
      try {
        const currentState = get();
        const requestParams = {
          page: params?.page ?? currentState.page,
          per_page: params?.per_page ?? currentState.per_page,
          search: params?.search ?? currentState.search,
        };

        const response = await getInstallments(requestParams);
        set({
          installments: response.data,
          meta: response.meta,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: "Error al cargar las cuotas",
          isLoading: false,
        });
        errorToast("Error al cargar las cuotas");
      }
    },

    // Fetch all installments (no pagination) for summary
    fetchAllInstallments: async () => {
      set({ isLoadingAll: true, error: undefined });
      try {
        const data = await getAllInstallments();
        set({
          allInstallments: data,
          isLoadingAll: false,
        });
      } catch (error) {
        set({
          error: "Error al cargar el resumen de cuotas",
          isLoadingAll: false,
        });
        errorToast("Error al cargar el resumen de cuotas");
      }
    },

    // Set page and refetch
    setPage: (page: number) => {
      set({ page });
      get().fetchInstallments({ page });
    },

    // Set per_page and refetch
    setPerPage: (per_page: number) => {
      set({ per_page, page: 1 }); // Reset to page 1 when changing per_page
      get().fetchInstallments({ per_page, page: 1 });
    },

    // Set search term
    setSearch: (search: string) => {
      set({ search });
    },

    // Reset state
    reset: () => {
      set({
        installments: [],
        allInstallments: [],
        meta: undefined,
        page: 1,
        per_page: DEFAULT_PER_PAGE,
        search: "",
        error: undefined,
      });
    },
  })
);
