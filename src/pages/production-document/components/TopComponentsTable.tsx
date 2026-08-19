import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import type { TopComponent } from "../lib/production-document-cost-report.interface";
import { formatCurrency } from "../lib/performance-report.utils";

const columns: ColumnDef<TopComponent>[] = [
  {
    accessorKey: "component_name",
    header: "Componente",
    cell: ({ row }) => (
      <span className="truncate max-w-[180px] block" title={row.original.component_name}>
        {row.original.component_name}
      </span>
    ),
  },
  {
    accessorKey: "total_qty_used",
    header: "Cant.",
    cell: ({ row }) => `${row.original.total_qty_used} ${row.original.unit}`,
  },
  {
    accessorKey: "avg_unit_cost",
    header: "C. Unit.",
    cell: ({ getValue }) => `S/ ${formatCurrency(getValue() as number)}`,
  },
  {
    accessorKey: "total_cost",
    header: "Total",
    cell: ({ getValue }) => (
      <span className="font-semibold">S/ {formatCurrency(getValue() as number)}</span>
    ),
  },
  {
    accessorKey: "share_pct",
    header: "% Participación",
    cell: ({ row }) => (
      <Badge
        variant={row.original.share_pct >= 30 ? "default" : "secondary"}
        className="text-xs"
      >
        {row.original.share_pct.toFixed(2)}%
      </Badge>
    ),
  },
  {
    accessorKey: "times_used",
    header: "Usos",
  },
];

interface TopComponentsTableProps {
  data: TopComponent[];
}

export function TopComponentsTable({ data }: TopComponentsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          Insumos Principales
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
