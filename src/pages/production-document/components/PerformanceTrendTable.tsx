import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { PerformanceTrend } from "../lib/production-document-performance-report.interface";
import { formatPct } from "../lib/performance-report.utils";

const columns: ColumnDef<PerformanceTrend>[] = [
  {
    accessorKey: "period",
    header: "Período",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "documents_count",
    header: "Docs",
  },
  {
    accessorKey: "total_qty_produced",
    header: "Producido",
  },
  {
    accessorKey: "total_waste_qty",
    header: "Merma",
  },
  {
    accessorKey: "efficiency_rate",
    header: "Eficiencia",
    cell: ({ getValue }) => formatPct(getValue() as number),
  },
];

interface PerformanceTrendTableProps {
  data: PerformanceTrend[];
}

export function PerformanceTrendTable({ data }: PerformanceTrendTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          Tendencia por Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          variant="simple"
          isVisibleColumnFilter={false}
        />
      </CardContent>
    </Card>
  );
}
