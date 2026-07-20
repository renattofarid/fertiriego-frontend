import { useQuery } from "@tanstack/react-query";
import { getAttendanceLogs } from "./attendance.actions";
import { ATTENDANCE_QUERY_KEY } from "./attendance.interface";

export function useAttendanceLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [ATTENDANCE_QUERY_KEY, params],
    queryFn: () => getAttendanceLogs({ params }),
    refetchOnWindowFocus: false,
  });
}
