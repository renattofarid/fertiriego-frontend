"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PredictiveAlert, UrgencyLevel } from "../lib/predictive.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PREDICTIVE_METRICS_ROUTE } from "../lib/predictive.interface";
import { ColumnActions } from "@/components/SelectActions";

const urgencyConfig: Record<
  UrgencyLevel,
  { label: string; variant: "destructive" | "default" | "secondary" | "outline" }
> = {
  CRITICO: { label: "Crítico", variant: "destructive" },
  ADVERTENCIA: { label: "Advertencia", variant: "default" },
  NORMAL: { label: "Normal", variant: "secondary" },
};

const MetricsButton = ({ productId }: { productId: number }) => {
  const navigate = useNavigate();
  return (
    <ColumnActions>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
        title="Ver métricas"
        onClick={() => navigate(`${PREDICTIVE_METRICS_ROUTE}/${productId}`)}
      >
        <BarChart2 className="h-4 w-4" />
      </Button>
    </ColumnActions>
  );
};

export const PredictiveAlertsColumns: ColumnDef<PredictiveAlert>[] = [
  {
    accessorKey: "urgency",
    header: "Urgencia",
    cell: ({ getValue }) => {
      const urgency = getValue() as UrgencyLevel;
      const config = urgencyConfig[urgency] ?? { label: urgency, variant: "outline" as const };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "current_stock",
    header: "Stock Actual",
    cell: ({ getValue }) => (
      <span className="font-mono">{(getValue() as number).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "reorder_point",
    header: "Punto de Reorden",
    cell: ({ getValue }) => (
      <span className="font-mono">{Number(getValue()).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "days_of_inventory_remaining",
    header: "Días Restantes",
    cell: ({ getValue }) => {
      const days = getValue() as number;
      const color =
        days < 7 ? "text-destructive" : days < 14 ? "text-amber-500" : "text-emerald-600";
      return (
        <span className={`font-mono font-semibold ${color}`}>
          {Number(days).toFixed(0)}
        </span>
      );
    },
  },
  {
    accessorKey: "suggested_purchase_qty",
    header: "Compra Sugerida",
    cell: ({ getValue }) => (
      <span className="font-mono">{Number(getValue()).toLocaleString()}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <MetricsButton productId={row.original.product_id} />,
  },
];
