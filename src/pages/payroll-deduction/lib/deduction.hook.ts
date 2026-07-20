import { useQuery } from "@tanstack/react-query";
import { getDeductions } from "./deduction.actions";
import { DEDUCTION } from "./deduction.interface";

export function useDeductions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [DEDUCTION.QUERY_KEY, params],
    queryFn: () => getDeductions({ params }),
    refetchOnWindowFocus: false,
  });
}
