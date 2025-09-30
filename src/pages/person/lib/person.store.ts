import { create } from "zustand";
import {
  getPersons,
  getAllPersons,
  findPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getPersonRoles,
  updatePersonRoles,
  getPersonRoleDetails,
} from "./person.actions";
import type {
  PersonResource,
  CreatePersonRequest,
  UpdatePersonRequest,
  GetPersonsProps,
  UpdatePersonRolesRequest,
  PersonRoleResource,
  PersonRoleDetailResource,
} from "./person.interface";
import type { Meta } from "@/lib/pagination.interface";

interface PersonStore {
  persons: PersonResource[] | null;
  person: PersonResource | null;
  allPersons: PersonResource[] | null;
  personRoles: PersonRoleResource[] | null;
  personRoleDetails: PersonRoleDetailResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  isLoadingRoles: boolean;
  isLoadingRoleDetails: boolean;
  error: string | null;
  fetchPersons: ({ params }: GetPersonsProps) => Promise<void>;
  fetchAllPersons: () => Promise<void>;
  fetchPersonById: (id: number) => Promise<void>;
  createPerson: (data: CreatePersonRequest) => Promise<void>;
  updatePerson: (id: number, data: UpdatePersonRequest) => Promise<void>;
  deletePerson: (id: number) => Promise<void>;
  fetchPersonRoles: (personId: number) => Promise<void>;
  fetchPersonRoleDetails: (personId: number) => Promise<void>;
  updatePersonRoles: (
    personId: number,
    data: UpdatePersonRolesRequest
  ) => Promise<void>;
  clearState: () => void;
}

export const usePersonStore = create<PersonStore>((set) => ({
  persons: null,
  person: null,
  allPersons: null,
  personRoles: null,
  personRoleDetails: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  isLoadingRoles: false,
  isLoadingRoleDetails: false,
  error: null,

  fetchPersons: async ({ params }: GetPersonsProps) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getPersons({ params });
      set({ persons: data, meta: meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar las personas", isLoading: false });
    }
  },

  fetchAllPersons: async () => {
    set({ error: null });
    try {
      const data = await getAllPersons();
      set({ allPersons: data });
    } catch {
      set({ error: "Error al cargar todas las personas" });
    }
  },

  fetchPersonById: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findPersonById(id);
      set({ person: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar la persona", isFinding: false });
    }
  },

  createPerson: async (data: CreatePersonRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await createPerson(data);
    } catch (err) {
      set({ error: "Error al crear la persona" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePerson: async (id: number, data: UpdatePersonRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePerson(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la persona" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deletePerson: async (id: number) => {
    set({ error: null });
    try {
      await deletePerson(id);
    } catch (err) {
      set({ error: "Error al eliminar la persona" });
      throw err;
    }
  },

  fetchPersonRoles: async (personId: number) => {
    set({ isLoadingRoles: true, error: null });
    try {
      const { data } = await getPersonRoles(personId);
      set({ personRoles: data, isLoadingRoles: false });
    } catch {
      set({
        error: "Error al cargar los roles de la persona",
        isLoadingRoles: false,
      });
    }
  },

  fetchPersonRoleDetails: async (personId: number) => {
    set({ isLoadingRoleDetails: true, error: null });
    try {
      const data = await getPersonRoleDetails(personId);
      set({ personRoleDetails: data, isLoadingRoleDetails: false });
    } catch {
      set({
        error: "Error al cargar los detalles de roles de la persona",
        isLoadingRoleDetails: false,
      });
    }
  },

  updatePersonRoles: async (
    personId: number,
    data: UpdatePersonRolesRequest
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePersonRoles(personId, data);
    } catch (err) {
      set({ error: "Error al actualizar los roles" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  clearState: () => {
    set({
      persons: null,
      person: null,
      allPersons: null,
      personRoles: null,
      meta: null,
      error: null,
    });
  },
}));
