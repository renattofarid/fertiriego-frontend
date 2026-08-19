import { useQuery } from "@tanstack/react-query";
import { getIncomes } from "./income.actions";
import { INCOME } from "./income.interface";

export function useIncomes(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [INCOME.QUERY_KEY, params],
    queryFn: () => getIncomes({ params }),
    refetchOnWindowFocus: false,
  });
}
