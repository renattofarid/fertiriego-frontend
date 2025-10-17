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
import type { PurchasePaymentResource } from "../lib/purchase.interface";
import { usePurchasePaymentStore } from "../lib/purchase-payment.store";
import { useState } from "react";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/lib/core.function";

interface PurchasePaymentTableProps {
  payments: PurchasePaymentResource[];
  onEdit: (paymentId: number) => void;
  onRefresh: () => void;
}

export function PurchasePaymentTable({
  payments,
  onEdit,
  onRefresh,
}: PurchasePaymentTableProps) {
  const { deletePayment } = usePurchasePaymentStore();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deletePayment(deleteId);
      successToast("Pago eliminado exitosamente");
      onRefresh();
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al eliminar el pago");
    } finally {
      setDeleteId(null);
    }
  };

  const calculateTotal = () => {
    return payments.reduce((sum, payment) => sum + payment.total_paid, 0);
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Badge variant="outline" className="text-lg p-3">
          No hay pagos registrados
        </Badge>
        <p className="text-sm mt-2">No se han realizado pagos a esta cuota</p>
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
              <TableHead>Fecha Pago</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead className="text-right">Efectivo</TableHead>
              <TableHead className="text-right">Yape</TableHead>
              <TableHead className="text-right">Plin</TableHead>
              <TableHead className="text-right">Depósito</TableHead>
              <TableHead className="text-right">Transfer.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <span className="text-sm font-semibold text-blue-600">
                    {payment.correlativo}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(payment.payment_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {payment.reference_number}
                </TableCell>
                <TableCell className="text-right">
                  {payment.amount_cash > 0 ? payment.amount_cash.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {payment.amount_yape > 0 ? payment.amount_yape.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {payment.amount_plin > 0 ? payment.amount_plin.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {payment.amount_deposit > 0 ? payment.amount_deposit.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {payment.amount_transfer > 0 ? payment.amount_transfer.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {payment.total_paid.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(payment.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(payment.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-sidebar">
              <TableCell colSpan={8} className="text-right font-bold">
                TOTAL PAGADO:
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
