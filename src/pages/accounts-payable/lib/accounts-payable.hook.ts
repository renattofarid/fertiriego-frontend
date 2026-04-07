import { useQuery } from "@tanstack/react-query";
import { getInstallments, getAllInstallments } from "./accounts-payable.actions";
import { ACCOUNTS_PAYABLE_QUERY_KEY } from "./accounts-payable.interface";

export function useAccountsPayable(params: Record<string, any>) {
  return useQuery({
    queryKey: [ACCOUNTS_PAYABLE_QUERY_KEY, params],
    queryFn: () => getInstallments(params),
  });
}

export function useAllAccountsPayable() {
  return useQuery({
    queryKey: [ACCOUNTS_PAYABLE_QUERY_KEY, "all"],
    queryFn: () => getAllInstallments(),
  });
}