import { create } from "zustand";
import {
  reviewVacation,
  storeVacation,
  storeVacationControl,
} from "./vacation.actions";
import type { VacationControlSchema, VacationSchema } from "./vacation.schema";
import type {
  ControlVacationResponse,
  ReviewVacationRequest,
} from "./vacation.interface";

interface VacationStore {
  isSubmitting: boolean;
  isReviewing: boolean;
  isConfiguringControl: boolean;
  error?: string;
  createVacation: (data: VacationSchema) => Promise<void>;
  reviewVacation: (id: number, data: ReviewVacationRequest) => Promise<void>;
  configureVacationControl: (
    personId: number,
    data: VacationControlSchema,
  ) => Promise<ControlVacationResponse>;
}

export const useVacationStore = create<VacationStore>((set) => ({
  isSubmitting: false,
  isReviewing: false,
  isConfiguringControl: false,
  error: undefined,

  createVacation: async (data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await storeVacation(data);
    } catch (err) {
      set({ error: "Error al crear la Solicitud de Vacaciones" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  reviewVacation: async (id, data) => {
    set({ isReviewing: true, error: undefined });
    try {
      await reviewVacation(id, data);
    } catch (err) {
      set({ error: "Error al revisar la Solicitud de Vacaciones" });
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  configureVacationControl: async (personId, data) => {
    set({ isConfiguringControl: true, error: undefined });
    try {
      return await storeVacationControl(personId, data);
    } catch (err) {
      set({ error: "Error al configurar el Control de Vacaciones" });
      throw err;
    } finally {
      set({ isConfiguringControl: false });
    }
  },
}));
