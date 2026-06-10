export interface CostReportParams {
  company_id?: number | null;
  date_from?: string | null;
  date_to?: string | null;
  product_id?: number | null;
  responsible_id?: number | null;
  warehouse_dest_id?: number | null;
  warehouse_origin_id?: number | null;
}

export interface CostReportSummary {
  total_documents: number;
  total_qty_produced: number;
  total_component_cost: number;
  total_labor_cost: number;
  total_overhead_cost: number;
  total_production_cost: number;
  component_cost_pct: number;
  labor_cost_pct: number;
  overhead_cost_pct: number;
  avg_unit_production_cost: number;
}

export interface CostTrend {
  period: string;
  documents_count: number;
  total_component_cost: number;
  total_labor_cost: number;
  total_overhead_cost: number;
  total_production_cost: number;
  total_qty_produced: number;
  avg_unit_cost: number;
}

export interface TopComponent {
  component_id: number;
  component_name: string;
  unit: string;
  total_qty_used: number;
  total_cost: number;
  avg_unit_cost: number;
  share_pct: number;
  times_used: number;
}

export interface DocumentCostComponent {
  component_id: number;
  component_name: string;
  unit: string;
  quantity_used: number;
  unit_cost: number;
  total_cost: number;
  share_of_component_cost: number;
  share_of_total_cost: number;
}

export interface DocumentCostBreakdown {
  component_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_cost: number;
  unit_cost: number;
  component_pct: number;
  labor_pct: number;
  overhead_pct: number;
}

export interface DocumentCost {
  document_id: number;
  document_number: string;
  production_date: string;
  responsible: string;
  currency: string;
  production_order: { id: number; order_number: string } | null;
  product: { id: number; name: string; unit: string };
  quantity_produced: number;
  cost_breakdown: DocumentCostBreakdown;
  top_component: { name: string; total_cost: number; share_pct: number } | null;
  components: DocumentCostComponent[];
}

export interface CostReportData {
  summary: CostReportSummary;
  cost_trend: CostTrend[];
  top_components: TopComponent[];
  document_costs: DocumentCost[];
  filters_applied: unknown[];
}

export interface CostReportResponse {
  message: string;
  data: CostReportData;
}
