import { useQuery } from "@tanstack/react-query";
import { getJustifications } from "./justification.actions";
import { JUSTIFICATION_QUERY_KEY } from "./justification.interface";

export function useJustifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [JUSTIFICATION_QUERY_KEY, params],
    queryFn: () => getJustifications({ params }),
    refetchOnWindowFocus: false,
  });
}
