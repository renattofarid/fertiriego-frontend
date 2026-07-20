import { useQuery } from "@tanstack/react-query";
import { getSalaries } from "./salary.actions";
import { SALARY } from "./salary.interface";

export function useSalaries(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [SALARY.QUERY_KEY, params],
    queryFn: () => getSalaries({ params }),
    refetchOnWindowFocus: false,
  });
}
