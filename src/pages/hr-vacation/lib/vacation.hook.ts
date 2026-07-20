import { useQuery } from "@tanstack/react-query";
import {
  getVacationControlSummary,
  getVacationPeriods,
  getVacations,
} from "./vacation.actions";
import {
  VACATION_CONTROL_QUERY_KEY,
  VACATION_PERIODS_QUERY_KEY,
  VACATION_QUERY_KEY,
} from "./vacation.interface";

export function useVacations(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [VACATION_QUERY_KEY, params],
    queryFn: () => getVacations({ params }),
    refetchOnWindowFocus: false,
  });
}

export function useVacationControlSummary(personId?: number) {
  return useQuery({
    queryKey: [VACATION_CONTROL_QUERY_KEY, personId],
    queryFn: () => getVacationControlSummary(personId as number),
    enabled: !!personId,
    refetchOnWindowFocus: false,
  });
}

export function useVacationPeriods(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [VACATION_PERIODS_QUERY_KEY, params],
    queryFn: () => getVacationPeriods({ params }),
    refetchOnWindowFocus: false,
  });
}
