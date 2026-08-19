import { create } from "zustand";
import { storeAssignSchedule, storeSchedule } from "./schedule.actions";
import type { ScheduleSchema } from "./schedule.schema";
import type { AssignScheduleRequest } from "./schedule.interface";

interface ScheduleStore {
  isSubmitting: boolean;
  isAssigning: boolean;
  error?: string;
  createSchedule: (data: ScheduleSchema) => Promise<void>;
  assignSchedule: (data: AssignScheduleRequest) => Promise<void>;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  isSubmitting: false,
  isAssigning: false,
  error: undefined,

  createSchedule: async (data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await storeSchedule(data);
    } catch (err) {
      set({ error: "Error al crear el Horario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  assignSchedule: async (data) => {
    set({ isAssigning: true, error: undefined });
    try {
      await storeAssignSchedule(data);
    } catch (err) {
      set({ error: "Error al asignar el Horario" });
      throw err;
    } finally {
      set({ isAssigning: false });
    }
  },
}));
