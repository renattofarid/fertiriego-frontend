import { useQuery } from "@tanstack/react-query";
import { getOvertimes } from "./overtime.actions";
import { OVERTIME_QUERY_KEY } from "./overtime.interface";

export function useOvertimes(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [OVERTIME_QUERY_KEY, params],
    queryFn: () => getOvertimes({ params }),
    refetchOnWindowFocus: false,
  });
}
