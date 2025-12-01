import type { Links, Meta } from "@/lib/pagination.interface";

export interface BoxDailyBalanceResource {
  id: number;
  box_id: number;
  date: string;
  opening_balance: number;
  total_income: number;
  total_outcome: number;
  closing_balance: number;
  created_at: string;
  updated_at: string;
}

export interface BoxDailyBalanceResponse {
  data: BoxDailyBalanceResource[];
  links: Links;
  meta: Meta;
}

export interface BoxDailyBalanceResourceById {
  data: BoxDailyBalanceResource;
}

export interface GetBoxDailyBalanceProps {
  params?: {
    box_id?: number;
    date?: string;
    page?: number;
    per_page?: number;
  };
}

export interface CreateBoxDailyBalanceProps {
  box_id: number;
  date: string;
}
