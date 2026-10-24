import { useQuery } from "@tanstack/react-query";
import { getPensionSystems } from "./pension-system.actions";
import { PENSION_SYSTEM } from "./pension-system.interface";

export function usePensionSystems(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PENSION_SYSTEM.QUERY_KEY, params],
    queryFn: () => getPensionSystems({ params }),
    refetchOnWindowFocus: false,
  });
}
