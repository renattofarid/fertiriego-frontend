import { create } from "zustand";
import { reviewJustification, storeJustification } from "./justification.actions";
import type { JustificationSchema } from "./justification.schema";
import type { ReviewJustificationRequest } from "./justification.interface";

interface JustificationStore {
  isSubmitting: boolean;
  isReviewing: boolean;
  error?: string;
  createJustification: (data: JustificationSchema) => Promise<void>;
  reviewJustification: (
    id: number,
    data: ReviewJustificationRequest,
  ) => Promise<void>;
}

export const useJustificationStore = create<JustificationStore>((set) => ({
  isSubmitting: false,
  isReviewing: false,
  error: undefined,

  createJustification: async (data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await storeJustification(data);
    } catch (err) {
      set({ error: "Error al crear la Justificación" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  reviewJustification: async (id, data) => {
    set({ isReviewing: true, error: undefined });
    try {
      await reviewJustification(id, data);
    } catch (err) {
      set({ error: "Error al revisar la Justificación" });
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },
}));
