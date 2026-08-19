import { useQuery } from "@tanstack/react-query";
import {
  getWorkerIncomesReport,
  getWorkerExpensesReport,
  getWorkerPayslipsReport,
} from "./payroll-report.actions";

export function useWorkerIncomesReport(personId: number, year: number) {
  return useQuery({
    queryKey: ["payroll-report-incomes", personId, year],
    queryFn: () => getWorkerIncomesReport(personId, year),
    enabled: !!personId,
    refetchOnWindowFocus: false,
  });
}

export function useWorkerExpensesReport(personId: number, year: number) {
  return useQuery({
    queryKey: ["payroll-report-expenses", personId, year],
    queryFn: () => getWorkerExpensesReport(personId, year),
    enabled: !!personId,
    refetchOnWindowFocus: false,
  });
}

export function useWorkerPayslipsReport(personId: number, year: number) {
  return useQuery({
    queryKey: ["payroll-report-payslips", personId, year],
    queryFn: () => getWorkerPayslipsReport(personId, year),
    enabled: !!personId,
    refetchOnWindowFocus: false,
  });
}
