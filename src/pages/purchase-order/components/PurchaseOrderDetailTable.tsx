import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PurchaseOrderDetailResource } from "../lib/purchase-order.interface";
import { usePurchaseOrderDetailStore } from "../lib/purchase-order-detail.store";
import { successToast, errorToast } from "@/lib/core.function";
import { useState } from "react";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { truncDecimal, formatDecimalTrunc } from "@/lib/utils";

interface PurchaseOrderDetailTableProps {
  details: PurchaseOrderDetailResource[];
  onEdit: (detailId: number) => void;
  onRefresh: () => void;
  totalEstimated?: string;
  applyIgv?: boolean;
}

export function PurchaseOrderDetailTable({
  details,
  onEdit,
  onRefresh,
  totalEstimated,
  applyIgv = false,
}: PurchaseOrderDetailTableProps) {
  const { deleteDetail } = usePurchaseOrderDetailStore();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDetail(deleteId);
      successToast("Detalle eliminado exitosamente");
      onRefresh();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al eliminar el detalle"
      );
    } finally {
      setDeleteId(null);
    }
  };

  // Calcular subtotal desde los detalles
  const calculateSubtotal = () => {
    return truncDecimal(
      details.reduce(
        (sum, detail) => sum + parseFloat(detail.subtotal_estimated),
        0
      ),
      6
    );
  };

  const subtotalBase = calculateSubtotal();

  // Si hay total_estimated del backend, usarlo; sino calcular con IGV si aplica
  const IGV_RATE = 0.18;
  const totalWithIgv = totalEstimated
    ? truncDecimal(parseFloat(totalEstimated), 6)
    : applyIgv
    ? truncDecimal(subtotalBase * (1 + IGV_RATE), 6)
    : subtotalBase;

  const igvAmount = applyIgv
    ? truncDecimal(totalWithIgv - truncDecimal(totalWithIgv / (1 + IGV_RATE), 6), 6)
    : 0;

  if (!details || details.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Badge variant="outline" className="text-lg p-3">
          No hay detalles en esta orden
        </Badge>
        <p className="text-sm mt-2">Agregue productos a la orden de compra</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correlativo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">P. Unitario</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>
                  <span className="text-sm font-semibold text-blue-600">
                    {detail.correlativo}
                  </span>
                </TableCell>
                <TableCell>{detail.product_name}</TableCell>
                <TableCell className="text-right">
                  {detail.quantity_requested}
                </TableCell>
                <TableCell className="text-right">
                  S/. {parseFloat(detail.unit_price_estimated).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  S/. {parseFloat(detail.subtotal_estimated).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(detail.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(detail.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-bold">
                SUBTOTAL:
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-primary">
                S/. {formatDecimalTrunc(subtotalBase, 6)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>

            {applyIgv && (
              <>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold">
                    IGV (18%):
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    S/. {formatDecimalTrunc(igvAmount, 6)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>

                <TableRow className="bg-muted">
                  <TableCell colSpan={4} className="text-right font-bold">
                    TOTAL (con IGV):
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">
                    S/. {formatDecimalTrunc(totalWithIgv, 6)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
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
