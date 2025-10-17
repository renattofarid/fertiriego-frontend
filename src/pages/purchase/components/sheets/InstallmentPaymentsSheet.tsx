import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PurchaseInstallmentResource } from "../../lib/purchase.interface";
import { usePurchasePaymentStore } from "../../lib/purchase-payment.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { PurchasePaymentTable } from "../PurchasePaymentTable";
import { PurchasePaymentForm } from "../forms/PurchasePaymentForm";
import { errorToast, successToast } from "@/lib/core.function";

interface InstallmentPaymentsSheetProps {
  open: boolean;
  onClose: () => void;
  installment: PurchaseInstallmentResource | null;
}

export function InstallmentPaymentsSheet({
  open,
  onClose,
  installment,
}: InstallmentPaymentsSheetProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

  const { user } = useAuthStore();

  const {
    payments,
    payment,
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    isSubmitting,
    resetPayment,
  } = usePurchasePaymentStore();

  useEffect(() => {
    if (installment && open) {
      fetchPayments(installment.id);
    }
  }, [installment, open]);

  useEffect(() => {
    if (editingPaymentId) {
      fetchPayment(editingPaymentId);
    } else {
      resetPayment();
    }
  }, [editingPaymentId]);

  const handleAddPayment = () => {
    setEditingPaymentId(null);
    setShowPaymentForm(true);
  };

  const handleEditPayment = (paymentId: number) => {
    setEditingPaymentId(paymentId);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (data: any) => {
    if (!installment || !user) return;

    try {
      if (editingPaymentId) {
        await updatePayment(editingPaymentId, {
          user_id: user.id,
          ...data,
        });
        successToast("Pago actualizado exitosamente");
      } else {
        await createPayment({
          purchase_installment_id: installment.id,
          user_id: user.id,
          route: "",
          ...data,
        });
        successToast("Pago registrado exitosamente");
      }
      setShowPaymentForm(false);
      setEditingPaymentId(null);
      fetchPayments(installment.id);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al guardar el pago");
    }
  };

  if (!installment) return null;

  const totalPaid = payments?.reduce((sum, p) => sum + parseFloat(p.total_paid.toString()), 0) || 0;
  const pending = parseFloat(installment.pending_amount.toString());

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pagos de Cuota {installment.correlativo}
          </SheetTitle>
          <SheetDescription>
            Gestiona los pagos realizados a esta cuota
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Información de la Cuota */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de la Cuota</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cuota #:</span>
                <p className="font-semibold text-lg">{installment.installment_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      installment.status === "PAGADO"
                        ? "default"
                        : installment.status === "VENCIDO"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {installment.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha Vencimiento:</span>
                <p className="font-semibold">
                  {new Date(installment.due_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Monto Original:</span>
                <p className="font-bold text-lg">
                  {parseFloat(installment.amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Pagado:</span>
                <p className="font-bold text-green-600 text-lg">
                  {totalPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Saldo Pendiente:</span>
                <p className="font-bold text-orange-600 text-lg">
                  {pending.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulario o Tabla de Pagos */}
          {showPaymentForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {editingPaymentId ? "Editar Pago" : "Registrar Pago"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PurchasePaymentForm
                  payment={editingPaymentId ? payment : null}
                  onSubmit={handlePaymentSubmit}
                  onCancel={() => {
                    setShowPaymentForm(false);
                    setEditingPaymentId(null);
                  }}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {pending > 0 && (
                <Button onClick={handleAddPayment} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              )}
              <PurchasePaymentTable
                payments={payments || []}
                onEdit={handleEditPayment}
                onRefresh={() => installment && fetchPayments(installment.id)}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
