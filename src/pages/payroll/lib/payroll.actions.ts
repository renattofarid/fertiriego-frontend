import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  PAYROLL,
  type PayrollResponse,
  type GetPayrollsProps,
  type CalculateMonthlyRequest,
  type CalculateMonthlyResponse,
  type CalculatePayslipRequest,
  type CalculatePayslipResponse,
  type SendPayslipsRequest,
  type SendPayslipsResponse,
} from "./payroll.interface";

const { ENDPOINT } = PAYROLL;
const BASE = "/payroll/hr";

export async function getPayrolls({
  params,
}: GetPayrollsProps = {}): Promise<PayrollResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<PayrollResponse>(ENDPOINT, config);
  return data;
}

export async function calculateMonthlyPayroll(
  data: CalculateMonthlyRequest,
): Promise<CalculateMonthlyResponse> {
  const response = await api.post<CalculateMonthlyResponse>(
    `${BASE}/calculate-monthly`,
    data,
  );
  return response.data;
}

export async function calculatePayslip(
  payrollId: number,
  data: CalculatePayslipRequest,
): Promise<CalculatePayslipResponse> {
  const response = await api.post<CalculatePayslipResponse>(
    `${BASE}/${payrollId}/payslips/calculate`,
    data,
  );
  return response.data;
}

export async function sendPayslips(
  payrollId: number,
  data: SendPayslipsRequest,
): Promise<SendPayslipsResponse> {
  const response = await api.post<SendPayslipsResponse>(
    `${BASE}/${payrollId}/send-payslips`,
    data,
  );
  return response.data;
}

export async function downloadPayslipPdf(
  payrollId: number,
  payslipId: number,
  fileName = `boleta-${payslipId}.pdf`,
): Promise<void> {
  const response = await api.get(
    `${BASE}/${payrollId}/payslips/${payslipId}/pdf`,
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
