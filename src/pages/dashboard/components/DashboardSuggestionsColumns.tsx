"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardSuggestion } from "../lib/dashboard.interface";
import { getUrgencyStyle } from "../lib/dashboard.constants";

export const DashboardSuggestionsColumns: ColumnDef<DashboardSuggestion>[] = [
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ row }) => {
      const s = row.original;
      const style = getUrgencyStyle(s.urgency);
      return (
        <div className="flex items-start gap-2">
          <span
            className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", style.dot)}
          />
          <div className="min-w-0">
            <p className="font-medium truncate">{s.product_name}</p>
            <Badge variant={style.badgeVariant} size="sm" className="mt-0.5">
              {s.urgency}
            </Badge>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {s.preferred_supplier?.name ?? "Sin proveedor"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "stock",
    header: "Stock / Inv.",
    cell: ({ row }) => {
      const s = row.original;
      const days = s.days_of_inventory_remaining;
      const color =
        days < 3
          ? "text-red-600 dark:text-red-400"
          : days < 7
            ? "text-orange-500 dark:text-orange-400"
            : "text-emerald-600 dark:text-emerald-400";
      return (
        <div className="text-sm leading-tight">
          <p className="font-mono font-semibold">
            {s.current_stock.toLocaleString("es-PE")}
            {s.incoming_stock > 0 && (
              <span className="text-muted-foreground font-normal">
                {" "}
                (+{s.incoming_stock.toLocaleString("es-PE")})
              </span>
            )}
          </p>
          <p className={cn("text-xs font-mono", color)}>{days} días inv.</p>
        </div>
      );
    },
  },
  {
    id: "suggested",
    header: "Sugerido",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="text-sm leading-tight">
          <p className="font-mono font-semibold">
            {s.suggested_purchase_qty.toLocaleString("es-PE")} und.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            S/ {s.estimated_cost.toLocaleString("es-PE")}
          </p>
        </div>
      );
    },
  },
];
