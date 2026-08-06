import { create } from "zustand";
import {
  detectOvertime,
  reviewOvertime,
  reviewBulkOvertime,
  setScheduleOvertimeRate,
  setWorkerOvertimeRate,
} from "./overtime.actions";
import type {
  DetectOvertimeRequest,
  DetectOvertimeResponse,
  ReviewOvertimeRequest,
  ReviewBulkOvertimeRequest,
  SetScheduleOvertimeRateRequest,
  SetWorkerOvertimeRateRequest,
} from "./overtime.interface";

interface OvertimeStore {
  isDetecting: boolean;
  isReviewing: boolean;
  isReviewingBulk: boolean;
  isSettingScheduleRate: boolean;
  isSettingWorkerRate: boolean;
  error?: string;
  detectOvertime: (data: DetectOvertimeRequest) => Promise<DetectOvertimeResponse>;
  reviewOvertime: (id: number, data: ReviewOvertimeRequest) => Promise<void>;
  reviewBulkOvertime: (data: ReviewBulkOvertimeRequest) => Promise<void>;
  setScheduleOvertimeRate: (
    id: number,
    data: SetScheduleOvertimeRateRequest,
  ) => Promise<void>;
  setWorkerOvertimeRate: (data: SetWorkerOvertimeRateRequest) => Promise<void>;
}

export const useOvertimeStore = create<OvertimeStore>((set) => ({
  isDetecting: false,
  isReviewing: false,
  isReviewingBulk: false,
  isSettingScheduleRate: false,
  isSettingWorkerRate: false,
  error: undefined,

  detectOvertime: async (data) => {
    set({ isDetecting: true, error: undefined });
    try {
      return await detectOvertime(data);
    } catch (err) {
      set({ error: "Error al calcular las Horas Extras" });
      throw err;
    } finally {
      set({ isDetecting: false });
    }
  },

  reviewOvertime: async (id, data) => {
    set({ isReviewing: true, error: undefined });
    try {
      await reviewOvertime(id, data);
    } catch (err) {
      set({ error: "Error al revisar la Hora Extra" });
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  reviewBulkOvertime: async (data) => {
    set({ isReviewingBulk: true, error: undefined });
    try {
      await reviewBulkOvertime(data);
    } catch (err) {
      set({ error: "Error al revisar las Horas Extras seleccionadas" });
      throw err;
    } finally {
      set({ isReviewingBulk: false });
    }
  },

  setScheduleOvertimeRate: async (id, data) => {
    set({ isSettingScheduleRate: true, error: undefined });
    try {
      await setScheduleOvertimeRate(id, data);
    } catch (err) {
      set({ error: "Error al configurar la tasa de horas extras del horario" });
      throw err;
    } finally {
      set({ isSettingScheduleRate: false });
    }
  },

  setWorkerOvertimeRate: async (data) => {
    set({ isSettingWorkerRate: true, error: undefined });
    try {
      await setWorkerOvertimeRate(data);
    } catch (err) {
      set({ error: "Error al configurar la tasa de horas extras del trabajador" });
      throw err;
    } finally {
      set({ isSettingWorkerRate: false });
    }
  },
}));
