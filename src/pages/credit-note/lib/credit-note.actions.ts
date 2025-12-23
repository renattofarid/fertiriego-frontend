import { api } from "@/lib/config";
import type {
  getCreditNoteProps,
  CreditNoteResponse,
  CreditNoteResourceById,
  CreditNoteReason,
} from "./credit-note.interface";
import type { CreditNoteSchema } from "./credit-note.schema";
import type { AxiosRequestConfig } from "axios";

export const getCreditNotes = async ({
  params,
}: getCreditNoteProps = {}): Promise<CreditNoteResponse> => {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const response = await api.get("/credit-notes", config);
  return response.data;
};

export const getCreditNoteReasons = async ({
  params,
}: getCreditNoteProps = {}): Promise<CreditNoteReason[]> => {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const response = await api.get("/credit-note-motives", config);
  return response.data;
};

export const getCreditNoteById = async (
  id: number
): Promise<CreditNoteResourceById> => {
  const response = await api.get(`/credit-notes/${id}`);
  return response.data;
};

export const createCreditNote = async (
  data: CreditNoteSchema
): Promise<CreditNoteResourceById> => {
  const response = await api.post("/credit-notes", data);
  return response.data;
};

export const updateCreditNote = async (
  id: number,
  data: CreditNoteSchema
): Promise<CreditNoteResourceById> => {
  const response = await api.put(`/credit-notes/${id}`, data);
  return response.data;
};

export const deleteCreditNote = async (id: number): Promise<void> => {
  await api.delete(`/credit-notes/${id}`);
};
