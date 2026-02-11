import { useEffect } from "react";
import { useBranchStore } from "./branch.store";
import { BRANCH } from "./branch.interface";
import { useQuery } from "@tanstack/react-query";
import { findBranchById } from "./branch.actions";

export function useBranch(params?: Record<string, unknown>) {
  const { branches, meta, isLoading, error, fetchBranches } = useBranchStore();

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
  return useQuery({
    queryKey: [BRANCH.QUERY_KEY, id],
    queryFn: () => findBranchById(id),
    enabled: !!id && id > 0,
  });
}
