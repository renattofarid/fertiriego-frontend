import { useQuery } from "@tanstack/react-query";
import { getSchedules } from "./schedule.actions";
import { SCHEDULE } from "./schedule.interface";

export function useSchedules(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [SCHEDULE.QUERY_KEY, params],
    queryFn: () => getSchedules({ params }),
    refetchOnWindowFocus: false,
  });
}
