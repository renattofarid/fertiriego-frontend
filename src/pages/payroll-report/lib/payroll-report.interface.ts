export interface PayrollReportLine {
  concept: string;
  type: string;
  amount: string;
  is_taxable?: boolean;
}

export interface PayrollReportWorker {
  id: number;
  full_name: string;
  email?: string;
}

export interface IncomesReportMonth {
  period: string;
  base_salary: string;
  other_incomes: string;
  gross_salary: string;
  lines: PayrollReportLine[];
}

export interface IncomesReportResponse {
  message: string;
  data: {
    worker: PayrollReportWorker;
    year: number;
    months: IncomesReportMonth[];
    totals: {
      gross_salary: number;
      other_incomes: number;
    };
  };
}

export interface ExpensesReportMonth {
  period: string;
  pension_deduction: string;
  income_tax: string;
  other_deductions: string;
  total_deductions: string;
  net_salary: string;
  lines: PayrollReportLine[];
}

export interface ExpensesReportResponse {
  message: string;
  data: {
    worker: PayrollReportWorker;
    year: number;
    months: ExpensesReportMonth[];
    totals: {
      pension_deduction: number;
      income_tax: number;
      other_deductions: number;
      total_deductions: number;
      net_salary: number;
    };
  };
}

export interface PayslipsReportItem {
  id: number;
  period: string;
  status: string;
  sent_at: string | null;
  gross_salary: string;
  total_deductions: string;
  net_salary: string;
  pension_system: { id: number; name: string; type: string } | null;
}

export interface PayslipsReportResponse {
  message: string;
  data: {
    worker: PayrollReportWorker;
    year: number;
    payslips: PayslipsReportItem[];
    annual_net: number;
  };
}
