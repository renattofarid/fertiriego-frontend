import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FileSpreadsheet } from "lucide-react";

const ROUTE = "/planillas";
const NAME = "Planilla";

export const PAYROLL: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Cálculo y gestión de planillas mensuales.",
    plural: "Planillas",
    gender: false,
  },
  ICON: "FileSpreadsheet",
  ICON_REACT: FileSpreadsheet,
  ENDPOINT: "/payroll/hr/payrolls",
  QUERY_KEY: "payrolls",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Calcular ${NAME}`,
      subtitle: `Complete los campos para calcular una nueva ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar la ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar la ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {},
};

export type PayrollStatus = "BORRADOR" | "CERRADO" | string;

export interface PayrollResource {
  id: number;
  year: number;
  month: number;
  period_label: string;
  status: PayrollStatus;
  total_gross: string;
  total_deductions: string;
  total_net: string;
  created_by?: string;
  closed_at: string | null;
  payslips_count: number;
  created_at: string;
}

export interface PayrollResponse {
  data: PayrollResource[];
  links: Links;
  meta: Meta;
}

export interface GetPayrollsProps {
  params?: Record<string, unknown>;
}

export interface ExtraIncomeInput {
  concept: string;
  amount: number;
  is_taxable?: boolean | null;
}

export interface ExtraDeductionInput {
  concept: string;
  amount: number;
}

export interface WorkerOverrideInput {
  person_id: number;
  extra_incomes?: ExtraIncomeInput[] | null;
  extra_deductions?: ExtraDeductionInput[] | null;
}

export interface CalculateMonthlyRequest {
  year: number;
  month: number;
  worker_overrides?: WorkerOverrideInput[] | null;
}

export interface CalculateMonthlyResponse {
  message: string;
  data: PayrollResource;
  payslips_count: number;
}

export interface CalculatePayslipRequest {
  person_id: number;
  extra_incomes?: ExtraIncomeInput[] | null;
  extra_deductions?: ExtraDeductionInput[] | null;
}

export interface PayslipLine {
  concept: string;
  type: string;
  amount: string;
  is_taxable?: boolean;
}

export interface PayslipResource {
  id: number;
  payroll_id: number;
  person_id: number;
  person_name: string;
  pension_system: { id: number; name: string; type: string } | null;
  base_salary: string;
  other_incomes: string;
  gross_salary: string;
  pension_deduction: string;
  income_tax: string;
  other_deductions: string;
  total_deductions: string;
  net_salary: string;
  status: string;
  sent_at: string | null;
  income_lines: PayslipLine[];
  deduction_lines: PayslipLine[];
  created_at: string;
}

export interface CalculatePayslipResponse {
  message: string;
  data: PayslipResource;
}

export interface SendPayslipsRequest {
  person_ids?: number[] | null;
}

export interface SendPayslipsFailure {
  person_id: number;
  name: string;
  reason: string;
}

export interface SendPayslipsResponse {
  message: string;
  data: {
    sent: number;
    failed_count: number;
    failed: SendPayslipsFailure[];
  };
}
