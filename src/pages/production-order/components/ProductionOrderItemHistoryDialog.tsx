import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { GeneralModal } from "@/components/GeneralModal";
import { DataTable } from "@/components/DataTable";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { History, Loader2 } from "lucide-react";
import { useProductionOrderItemHistory } from "../lib/production-order.hook";
import type { ProductionOrderItemHistoryEntry } from "../lib/production-order.interface";

interface ProductionOrderItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number | null;
  productName?: string;
}

export function ProductionOrderItemHistoryDialog({
  open,
  onOpenChange,
  itemId,
  productName,
}: ProductionOrderItemHistoryDialogProps) {
  const { data, isLoading } = useProductionOrderItemHistory(open ? itemId : null);

  const columns = useMemo<ColumnDef<ProductionOrderItemHistoryEntry>[]>(
    () => [
      {
        accessorKey: "document_number",
        header: "Documento",
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.original.document_number}</span>
        ),
      },
      {
        accessorKey: "production_date",
        header: "Fecha de Producción",
        cell: ({ row }) => <span>{row.original.production_date}</span>,
      },
      {
        accessorKey: "quantity_produced",
        header: "Cantidad Producida",
        cell: ({ row }) => (
          <span className="font-semibold">
            {Number(row.original.quantity_produced).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "produced_by",
        header: "Producido por",
        cell: ({ row }) => <span>{row.original.produced_by}</span>,
      },
    ],
    [],
  );

  const total = (data ?? []).reduce(
    (sum, entry) => sum + Number(entry.quantity_produced || 0),
    0,
  );

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Historial de Producción${productName ? ` - ${productName}` : ""}`}
      subtitle="Documentos de producción generados para este ítem"
      icon="History"
      size="3xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>Sin historial de producción</EmptyTitle>
              <EmptyDescription>
                Este ítem aún no tiene documentos de producción registrados
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Documentos</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Producido</p>
                <p className="text-2xl font-bold">{total.toFixed(2)}</p>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={data}
              isVisibleColumnFilter={false}
              variant="default"
            />
          </>
        )}
      </div>
    </GeneralModal>
  );
}
