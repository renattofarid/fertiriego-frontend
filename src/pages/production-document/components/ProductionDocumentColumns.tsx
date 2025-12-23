import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { ProductionDocumentResource } from "../lib/production-document.interface";

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PROCESADO: "default",
  CANCELADO: "destructive",
};

export const createProductionDocumentColumns = (
  onView: (id: number) => void
): ColumnDef<ProductionDocumentResource>[] => [
  {
    accessorKey: "document_number",
    header: "Documento",
    cell: ({ row }) => (
      <div>
        <div className="font-mono font-bold">{row.original.document_number}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.production_date_formatted}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.product_name}</div>
        <div className="text-sm text-muted-foreground">
          Cantidad: {row.original.quantity_produced}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "warehouse_origin_name",
    header: "Almacén Origen",
    cell: ({ row }) => <span>{row.original.warehouse_origin_name}</span>,
  },
  {
    accessorKey: "warehouse_dest_name",
    header: "Almacén Destino",
    cell: ({ row }) => <span>{row.original.warehouse_dest_name}</span>,
  },
  {
    accessorKey: "responsible_name",
    header: "Responsable",
    cell: ({ row }) => <span>{row.original.responsible_name}</span>,
  },
  {
    accessorKey: "total_production_cost",
    header: "Costo Total",
    cell: ({ row }) => (
      <span className="font-semibold">
        S/ {row.original.total_production_cost.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={statusVariants[row.original.status] || "default"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView(row.original.id)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];
