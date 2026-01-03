import { create } from "zustand";
import { getAllPersons } from "@/pages/person/lib/person.actions";
import type {
  PersonResource,
  GetPersonsProps,
} from "@/pages/person/lib/person.interface";
import { DRIVER_ROLE_CODE } from "./driver.interface";

interface DriverStore {
  allDrivers: PersonResource[] | null;
  isLoading: boolean;
  error?: string;
  fetchAllDrivers: (params?: Record<string, unknown>) => Promise<void>;
  clearDrivers: () => void;
}

export const useDriverStore = create<DriverStore>((set) => ({
  allDrivers: null,
  isLoading: false,
  error: undefined,

  fetchAllDrivers: async (params?: Record<string, unknown>) => {
    set({ isLoading: true, error: undefined });
    try {
      const driverParams: GetPersonsProps = {
        params: {
          ...params,
          role_names: [DRIVER_ROLE_CODE],
        },
      };
      const data = await getAllPersons(driverParams);
      set({ allDrivers: data, isLoading: false });
    } catch {
      set({ error: "Error al cargar los conductores", isLoading: false });
    }
  },

  clearDrivers: () => {
    set({
      allDrivers: null,
      error: undefined,
    });
  },
}));
