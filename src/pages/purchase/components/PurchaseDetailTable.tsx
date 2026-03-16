import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseDetailResource } from "../lib/purchase.interface";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { useState } from "react";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { DataTable } from "@/components/DataTable";

interface PurchaseDetailTableProps {
  details: PurchaseDetailResource[];
  onEdit: (detailId: number) => void;
  onRefresh: () => void;
  isPurchasePaid?: boolean;
}

export function PurchaseDetailTable({
  details,
  onEdit,
  onRefresh,
  isPurchasePaid = false,
}: PurchaseDetailTableProps) {
  const { deleteDetail } = usePurchaseDetailStore();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDetail(deleteId);
      onRefresh();
    } catch {
      // El error ya se maneja en el store
    } finally {
      setDeleteId(null);
    }
  };

  const calculateTotal = () =>
    details.reduce((sum, detail) => sum + parseFloat(detail.total), 0);

  const columns: ColumnDef<PurchaseDetailResource>[] = [
    {
      accessorKey: "correlativo",
      header: "Correlativo",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-blue-600">
          {row.original.correlativo}
        </span>
      ),
    },
    {
      accessorKey: "product_name",
      header: "Producto",
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Cantidad</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.original.quantity).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "unit_price",
      header: () => <div className="text-right">P. Unit.</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.original.unit_price).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "subtotal",
      header: () => <div className="text-right">Subtotal</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.original.subtotal).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "tax",
      header: () => <div className="text-right">Impuesto</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.original.tax).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-primary">
          {parseFloat(row.original.total).toFixed(2)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          {isPurchasePaid ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="ghost" disabled className="cursor-not-allowed">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>No se puede editar un detalle de compra pagada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button variant="ghost" onClick={() => onEdit(row.original.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {isPurchasePaid ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="ghost" disabled className="cursor-not-allowed">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>No se puede eliminar un detalle de compra pagada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button variant="ghost" onClick={() => setDeleteId(row.original.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!details || details.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Badge variant="outline" className="text-lg p-3">
          No hay detalles en esta compra
        </Badge>
        <p className="text-sm mt-2">Agregue productos a la compra</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={details}
        variant="outline"
        isVisibleColumnFilter={false}
      />

      <div className="flex justify-end mt-1 px-2">
        <span className="font-bold text-sm text-muted-foreground mr-4">TOTAL:</span>
        <span className="font-bold text-lg text-primary">
          {calculateTotal().toFixed(2)}
        </span>
      </div>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
