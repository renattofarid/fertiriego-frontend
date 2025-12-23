import { api } from "@/lib/config";
import type { getCreditNoteProps, CreditNoteResponse, CreditNoteResourceById } from "./credit-note.interface";
import type { CreditNoteSchema } from "./credit-note.schema";

export const getCreditNotes = async ({ params }: getCreditNoteProps = {}): Promise<CreditNoteResponse> => {
  const response = await api.get("/credit-notes", { params });
  return response.data;
};

export const getCreditNoteById = async (id: number): Promise<CreditNoteResourceById> => {
  const response = await api.get(`/credit-notes/${id}`);
  return response.data;
};

export const createCreditNote = async (data: CreditNoteSchema): Promise<CreditNoteResourceById> => {
  const response = await api.post("/credit-notes", data);
  return response.data;
};

export const updateCreditNote = async (id: number, data: CreditNoteSchema): Promise<CreditNoteResourceById> => {
  const response = await api.put(`/credit-notes/${id}`, data);
  return response.data;
};

export const deleteCreditNote = async (id: number): Promise<void> => {
  await api.delete(`/credit-notes/${id}`);
};
