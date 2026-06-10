import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { PerformanceByProduct } from "../lib/production-document-performance-report.interface";
import { formatCurrency, formatPct } from "../lib/performance-report.utils";

const columns: ColumnDef<PerformanceByProduct>[] = [
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ row }) => (
      <span className="truncate max-w-[160px] block" title={row.original.product_name}>
        {row.original.product_name}
      </span>
    ),
  },
  {
    accessorKey: "total_qty_produced",
    header: "Producido",
    cell: ({ row }) => `${row.original.total_qty_produced} ${row.original.unit}`,
  },
  {
    accessorKey: "avg_efficiency_rate",
    header: "Eficiencia",
    cell: ({ row }) => (
      <Badge
        variant={row.original.avg_efficiency_rate >= 90 ? "default" : "secondary"}
        className="text-xs"
      >
        {formatPct(row.original.avg_efficiency_rate)}
      </Badge>
    ),
  },
  {
    accessorKey: "avg_unit_cost",
    header: "Costo unit.",
    cell: ({ getValue }) => `S/ ${formatCurrency(getValue() as number)}`,
  },
];

interface PerformanceByProductTableProps {
  data: PerformanceByProduct[];
}

export function PerformanceByProductTable({ data }: PerformanceByProductTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          Rendimiento por Producto
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
