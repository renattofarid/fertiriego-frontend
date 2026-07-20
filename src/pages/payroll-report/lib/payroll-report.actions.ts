import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type {
  IncomesReportResponse,
  ExpensesReportResponse,
  PayslipsReportResponse,
} from "./payroll-report.interface";

const BASE = "/payroll/hr/reports";

export async function getWorkerIncomesReport(
  personId: number,
  year: number,
): Promise<IncomesReportResponse> {
  const config: AxiosRequestConfig = { params: { year } };
  const { data } = await api.get<IncomesReportResponse>(
    `${BASE}/incomes/${personId}`,
    config,
  );
  return data;
}

export async function getWorkerExpensesReport(
  personId: number,
  year: number,
): Promise<ExpensesReportResponse> {
  const config: AxiosRequestConfig = { params: { year } };
  const { data } = await api.get<ExpensesReportResponse>(
    `${BASE}/expenses/${personId}`,
    config,
  );
  return data;
}

export async function getWorkerPayslipsReport(
  personId: number,
  year: number,
): Promise<PayslipsReportResponse> {
  const config: AxiosRequestConfig = { params: { year } };
  const { data } = await api.get<PayslipsReportResponse>(
    `${BASE}/payslips/${personId}`,
    config,
  );
  return data;
}
