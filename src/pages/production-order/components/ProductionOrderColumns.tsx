import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, FilePlus } from "lucide-react";
import type { ProductionOrderResource, ProductionOrderStatus } from "../lib/production-order.interface";

const statusConfig: Record<
  ProductionOrderStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  BORRADOR:  { label: "Borrador",  dot: "bg-slate-400",  text: "text-slate-700",  bg: "bg-slate-100"  },
  PENDIENTE: { label: "Pendiente", dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-100"  },
  APROBADO:  { label: "Aprobado",  dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-100"  },
  RECHAZADO: { label: "Rechazado", dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-100"    },
  PROCESADO: { label: "Procesado", dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-100"   },
  ANULADO:   { label: "Anulado",   dot: "bg-zinc-400",   text: "text-zinc-600",   bg: "bg-zinc-100"   },
};

export const createProductionOrderColumns = (
  onView: (id: number) => void,
  onGenerateDocument?: (id: number) => void
): ColumnDef<ProductionOrderResource>[] => [
  {
    accessorKey: "order_number",
    header: "N° Orden",
    cell: ({ row }) => (
      <div>
        <div className="font-mono font-bold">{row.original.order_number}</div>
        <div className="text-sm text-muted-foreground">{row.original.requested_date}</div>
      </div>
    ),
  },
  {
    accessorKey: "quantity_requested",
    header: "Cant. Solicitada",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.quantity_requested}</div>
        <div className="text-sm text-muted-foreground">{row.original.currency}</div>
      </div>
    ),
  },
  {
    accessorKey: "estimated_component_cost",
    header: "Costo Componentes",
    cell: ({ row }) => (
      <span>S/ {row.original.estimated_component_cost.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "labor_cost",
    header: "C. Laboral",
    cell: ({ row }) => (
      <span>S/ {row.original.labor_cost.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "estimated_total_cost",
    header: "Costo Total",
    cell: ({ row }) => (
      <span className="font-semibold">S/ {row.original.estimated_total_cost.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const cfg = statusConfig[status] ?? statusConfig.BORRADOR;
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
        >
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onView(row.original.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        {onGenerateDocument &&
          row.original.status === "APROBADO" &&
          row.original.production_document_id === null && (
            <Button
              variant="ghost"
              size="sm"
              tooltip="Generar Documento de Producción"
              onClick={() => onGenerateDocument(row.original.id)}
            >
              <FilePlus className="h-4 w-4 text-green-600" />
            </Button>
          )}
      </div>
    ),
  },
];
