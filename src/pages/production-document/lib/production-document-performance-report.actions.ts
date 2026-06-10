import { api } from "@/lib/config";
import type {
  PerformanceReportParams,
  PerformanceReportResponse,
} from "./production-document-performance-report.interface";

export async function getProductionDocumentPerformanceReport(
  params?: PerformanceReportParams
): Promise<PerformanceReportResponse> {
  const response = await api.get<PerformanceReportResponse>(
    "/productiondocument-report/performance",
    { params }
  );
  return response.data;
}
