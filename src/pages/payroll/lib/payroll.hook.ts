import { useQuery } from "@tanstack/react-query";
import { getPayrolls, getPayslips } from "./payroll.actions";
import { PAYROLL } from "./payroll.interface";

export function usePayrolls(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PAYROLL.QUERY_KEY, params],
    queryFn: () => getPayrolls({ params }),
    refetchOnWindowFocus: false,
  });
}

export function usePayslips(
  payrollId: number,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: [PAYROLL.QUERY_KEY, payrollId, "payslips", params],
    queryFn: () => getPayslips({ payrollId, params }),
    enabled: Number.isFinite(payrollId) && payrollId > 0,
    refetchOnWindowFocus: false,
  });
}
