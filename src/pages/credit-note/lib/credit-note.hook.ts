import { useEffect } from "react";
import { useCreditNoteStore } from "./credit-note.store";

export function useCreditNote(params?: Record<string, unknown>) {
  const { creditNotes, meta, isLoading, error, fetchCreditNotes } = useCreditNoteStore();

  useEffect(() => {
    if (!creditNotes) fetchCreditNotes(params);
  }, [creditNotes, fetchCreditNotes]);

  return {
    data: creditNotes,
    meta,
    isLoading,
    error,
    refetch: fetchCreditNotes,
  };
}

export function useAllCreditNotes() {
  const { allCreditNotes, isLoadingAll, error, fetchAllCreditNotes } = useCreditNoteStore();

  useEffect(() => {
    if (!allCreditNotes) fetchAllCreditNotes();
  }, [allCreditNotes, fetchAllCreditNotes]);

  return {
    data: allCreditNotes,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllCreditNotes,
  };
}

export function useCreditNoteById(id: number) {
  const { creditNote, isFinding, error, fetchCreditNote } = useCreditNoteStore();

  useEffect(() => {
    fetchCreditNote(id);
  }, [id]);

  return {
    data: creditNote,
    isFinding,
    error,
    refetch: () => fetchCreditNote(id),
  };
}
