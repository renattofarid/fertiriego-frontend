import { useEffect } from "react";
import { useDebitNoteStore } from "./debit-note.store";

export function useDebitNote(params?: Record<string, unknown>) {
  const { debitNotes, meta, isLoading, error, fetchDebitNotes } =
    useDebitNoteStore();

  useEffect(() => {
    if (!debitNotes) fetchDebitNotes(params);
  }, [debitNotes, fetchDebitNotes]);

  return {
    data: debitNotes,
    meta,
    isLoading,
    error,
    refetch: fetchDebitNotes,
  };
}

export function useDebitNoteReasons() {
  const { allDebitNoteReasons, fetchAllDebitNoteReasons, isLoadingAllReasons } =
    useDebitNoteStore();

  useEffect(() => {
    if (!allDebitNoteReasons) fetchAllDebitNoteReasons();
  }, [allDebitNoteReasons, fetchAllDebitNoteReasons]);

  return {
    data: allDebitNoteReasons,
    isLoading: isLoadingAllReasons,
    refetch: fetchAllDebitNoteReasons,
  };
}

export function useAllDebitNotes() {
  const { allDebitNotes, isLoadingAll, error, fetchAllDebitNotes } =
    useDebitNoteStore();

  useEffect(() => {
    if (!allDebitNotes) fetchAllDebitNotes();
  }, [allDebitNotes, fetchAllDebitNotes]);

  return {
    data: allDebitNotes,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllDebitNotes,
  };
}

export function useDebitNoteById(id: number) {
  const { debitNote, isFinding, error, fetchDebitNote } = useDebitNoteStore();

  useEffect(() => {
    fetchDebitNote(id);
  }, [id]);

  return {
    data: debitNote,
    isFinding,
    error,
    refetch: () => fetchDebitNote(id),
  };
}
