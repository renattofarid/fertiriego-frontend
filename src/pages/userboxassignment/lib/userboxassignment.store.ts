import { create } from "zustand";
import {
  findUserBoxAssignmentById,
  getAllUserBoxAssignments,
  getUserBoxAssignment,
  storeUserBoxAssignment,
  updateUserBoxAssignment,
} from "./userboxassignment.actions";
import type { UserBoxAssignmentSchema } from "./userboxassignment.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { UserBoxAssignmentResource } from "./userboxassignment.interface";

interface UserBoxAssignmentStore {
  allUserBoxAssignments: UserBoxAssignmentResource[] | null;
  userBoxAssignments: UserBoxAssignmentResource[] | null;
  userBoxAssignment: UserBoxAssignmentResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllUserBoxAssignments: () => Promise<void>;
  fetchUserBoxAssignments: (params?: Record<string, any>) => Promise<void>;
  fetchUserBoxAssignment: (id: number) => Promise<void>;
  createUserBoxAssignment: (data: UserBoxAssignmentSchema) => Promise<void>;
  updateUserBoxAssignment: (id: number, data: UserBoxAssignmentSchema) => Promise<void>;
}

export const useUserBoxAssignmentStore = create<UserBoxAssignmentStore>((set) => ({
  allUserBoxAssignments: null,
  userBoxAssignment: null,
  userBoxAssignments: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchUserBoxAssignments: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getUserBoxAssignment({ params });
      set({ userBoxAssignments: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar asignaciones", isLoading: false });
    }
  },

  fetchAllUserBoxAssignments: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const data = await getAllUserBoxAssignments();
      set({ allUserBoxAssignments: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar asignaciones", isLoadingAll: false });
    }
  },

  fetchUserBoxAssignment: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findUserBoxAssignmentById(id);
      set({ userBoxAssignment: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la asignación", isFinding: false });
    }
  },

  createUserBoxAssignment: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await storeUserBoxAssignment(data);
    } catch (err) {
      set({ error: "Error al crear la Asignación" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateUserBoxAssignment: async (id: number, data: UserBoxAssignmentSchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateUserBoxAssignment(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Asignación" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
