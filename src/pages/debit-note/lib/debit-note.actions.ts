import { api } from "@/lib/config";
import type {
  getDebitNoteProps,
  DebitNoteResponse,
  DebitNoteResourceById,
  DebitNoteReason,
} from "./debit-note.interface";
import type { AxiosRequestConfig } from "axios";
import type { DebitNoteSchema } from "./debit-note.schema";

export const getDebitNotes = async ({
  params,
}: getDebitNoteProps = {}): Promise<DebitNoteResponse> => {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const response = await api.get("/debit-notes", config);
  return response.data;
};

export const getDebitNoteReasons = async ({
  params,
}: getDebitNoteProps = {}): Promise<DebitNoteReason[]> => {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const response = await api.get("/debit-motives", config);
  return response.data;
};

export const getDebitNoteById = async (
  id: number
): Promise<DebitNoteResourceById> => {
  const response = await api.get(`/debit-notes/${id}`);
  return response.data;
};

export const createDebitNote = async (
  data: DebitNoteSchema
): Promise<DebitNoteResourceById> => {
  const response = await api.post("/debit-notes", data);
  return response.data;
};

export const updateDebitNote = async (
  id: number,
  data: DebitNoteSchema
): Promise<DebitNoteResourceById> => {
  const response = await api.put(`/debit-notes/${id}`, data);
  return response.data;
};

export const deleteDebitNote = async (id: number): Promise<void> => {
  await api.delete(`/debit-notes/${id}`);
};
