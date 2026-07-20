import { useQuery } from "@tanstack/react-query";
import { getPayrolls } from "./payroll.actions";
import { PAYROLL } from "./payroll.interface";

export function usePayrolls(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PAYROLL.QUERY_KEY, params],
    queryFn: () => getPayrolls({ params }),
    refetchOnWindowFocus: false,
  });
}
