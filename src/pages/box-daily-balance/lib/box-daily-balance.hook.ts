import { useEffect } from "react";
import { useBoxDailyBalanceStore } from "./box-daily-balance.store";

export function useBoxDailyBalance(params?: Record<string, unknown>) {
  const { balances, meta, isLoading, error, fetchBalances } = useBoxDailyBalanceStore();

  useEffect(() => {
    fetchBalances(params);
  }, []);

  return {
    data: balances,
    meta,
    isLoading,
    error,
    refetch: fetchBalances,
  };
}
