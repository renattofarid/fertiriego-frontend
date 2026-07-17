export interface PerformanceReportParams {
  company_id?: number | null;
  date_from?: string | null;
  date_to?: string | null;
  product_id?: number | null;
  responsible_id?: number | null;
  warehouse_dest_id?: number | null;
  warehouse_origin_id?: number | null;
}

export interface PerformanceReportSummary {
  total_documents: number;
  total_qty_produced: number;
  total_required_qty: number;
  total_used_qty: number;
  total_waste_qty: number;
  global_efficiency_rate: number;
  global_waste_percentage: number;
  total_production_cost: number;
  avg_unit_production_cost: number;
}

export interface PerformanceTrend {
  period: string;
  documents_count: number;
  total_qty_produced: number;
  total_waste_qty: number;
  efficiency_rate: number;
  waste_rate: number;
}

export interface PerformanceByProduct {
  product_id: number;
  product_name: string;
  unit: string;
  total_documents: number;
  total_qty_produced: number;
  total_component_cost: number;
  total_production_cost: number;
  avg_unit_cost: number;
  total_waste_qty: number;
  avg_waste_rate: number;
  avg_efficiency_rate: number;
}

export interface PerformanceDocumentComponent {
  component_id: number;
  component_name: string;
  unit: string;
  quantity_required: number;
  quantity_used: number;
  waste_quantity: number;
  waste_percentage: number;
  unit_cost: number;
  total_cost: number;
}

export interface PerformanceDocumentDetail {
  document_id: number;
  document_number: string;
  production_date: string;
  production_order: { id: number; order_number: string } | null;
  responsible: string;
  warehouse_origin: string;
  warehouse_dest: string;
  product: { id: number; name: string; unit: string };
  quantity_produced: number;
  total_components: number;
  total_required_qty: number;
  total_used_qty: number;
  total_waste_qty: number;
  efficiency_rate: number;
  waste_rate: number;
  total_component_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_production_cost: number;
  unit_production_cost: number;
  components: PerformanceDocumentComponent[];
}

export interface PerformanceReportData {
  summary: PerformanceReportSummary;
  trend: PerformanceTrend[];
  by_product: PerformanceByProduct[];
  document_details: PerformanceDocumentDetail[];
  filters_applied: unknown[];
}

export interface PerformanceReportResponse {
  message: string;
  data: PerformanceReportData;
}
