import { api } from "@/lib/config";
import type {
  CostReportParams,
  CostReportResponse,
} from "./production-document-cost-report.interface";

export async function getProductionDocumentCostReport(
  params?: CostReportParams
): Promise<CostReportResponse> {
  const response = await api.get<CostReportResponse>(
    "/productiondocument-report/costs",
    { params }
  );
  return response.data;
}
