import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PurchaseDetailResource } from "../lib/purchase.interface";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { useState } from "react";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/lib/core.function";

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

  const calculateTotal = () => {
    return details.reduce((sum, detail) => sum + parseFloat(detail.total), 0);
  };

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
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correlativo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">P. Unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Impuesto</TableHead>
              <TableHead className="text-right">Total</TableHead>
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
                  {parseFloat(detail.quantity).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(detail.unit_price).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(detail.subtotal).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(detail.tax).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {parseFloat(detail.total).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    {isPurchasePaid ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="cursor-not-allowed"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>No se puede editar un detalle de compra pagada</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(detail.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    {isPurchasePaid ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="cursor-not-allowed"
                              >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(detail.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-sidebar">
              <TableCell colSpan={6} className="text-right font-bold">
                TOTAL:
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-green-600">
                {calculateTotal().toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
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
