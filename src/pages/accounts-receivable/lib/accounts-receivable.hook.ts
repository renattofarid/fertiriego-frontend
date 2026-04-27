import { useQuery } from "@tanstack/react-query";
import { getInstallments, getAllInstallments } from "./accounts-receivable.actions";
import { ACCOUNTS_RECEIVABLE_QUERY_KEY } from "./accounts-receivable.interface";

export function useAccountsReceivable(params: Record<string, any>) {
  return useQuery({
    queryKey: [ACCOUNTS_RECEIVABLE_QUERY_KEY, params],
    queryFn: () => getInstallments(params),
  });
}

export function useAllAccountsReceivable() {
  return useQuery({
    queryKey: [ACCOUNTS_RECEIVABLE_QUERY_KEY, "all"],
    queryFn: () => getAllInstallments(),
  });
}