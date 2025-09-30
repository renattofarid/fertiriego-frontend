import { useEffect } from "react";
import { useBranchStore } from "./branch.store";

export function useBranch(params?: Record<string, unknown>) {
  const { branches, meta, isLoading, error, fetchBranches } =
    useBranchStore();

  useEffect(() => {
    if (!branches) fetchBranches(params);
  }, [branches, fetchBranches]);

  return {
    data: branches,
    meta,
    isLoading,
    error,
    refetch: fetchBranches,
  };
}

export function useAllBranches() {
  const { allBranches, isLoadingAll, error, fetchAllBranches } =
    useBranchStore();

  useEffect(() => {
    if (!allBranches) fetchAllBranches();
  }, [allBranches, fetchAllBranches]);

  return {
    data: allBranches,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllBranches,
  };
}

export function useBranchById(id: number) {
  const { branch, isFinding, error, fetchBranch } = useBranchStore();

  useEffect(() => {
    fetchBranch(id);
  }, [id]);

  return {
    data: branch,
    isFinding,
    error,
    refetch: () => fetchBranch(id),
  };
}