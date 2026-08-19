import { useQuery } from "@tanstack/react-query";
import { getSalaries, getPensionSystems } from "./salary.actions";
import { SALARY } from "./salary.interface";

export function useSalaries(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [SALARY.QUERY_KEY, params],
    queryFn: () => getSalaries({ params }),
    refetchOnWindowFocus: false,
  });
}

export function usePensionSystems(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["pension-systems", params],
    queryFn: () => getPensionSystems({ params }),
    refetchOnWindowFocus: false,
  });
}
