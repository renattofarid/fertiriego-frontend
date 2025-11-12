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
import { usePurchaseInstallmentStore } from "../../lib/purchase-installment.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { PurchasePaymentTable } from "../PurchasePaymentTable";
import { PurchasePaymentForm } from "../forms/PurchasePaymentForm";
import { errorToast, successToast } from "@/lib/core.function";

interface InstallmentPaymentsSheetProps {
  open: boolean;
  onClose: () => void;
  installment: PurchaseInstallmentResource | null;
  onPaymentSuccess?: () => void;
}

export function InstallmentPaymentsSheet({
  open,
  onClose,
  installment,
  onPaymentSuccess,
}: InstallmentPaymentsSheetProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [currentInstallment, setCurrentInstallment] = useState<PurchaseInstallmentResource | null>(installment);

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

  const {
    installment: updatedInstallment,
    fetchInstallment,
  } = usePurchaseInstallmentStore();

  useEffect(() => {
    if (installment && open) {
      setCurrentInstallment(installment);
      fetchPayments(installment.id);
      fetchInstallment(installment.id);
    }
  }, [installment, open]);

  // Actualizar el estado local cuando llegue la cuota actualizada del store
  useEffect(() => {
    if (updatedInstallment) {
      setCurrentInstallment(updatedInstallment);
    }
  }, [updatedInstallment]);

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
      
      // Refrescar pagos y cuota actualizada
      await fetchPayments(installment.id);
      await fetchInstallment(installment.id);
      
      // Notificar al componente padre que hubo un pago exitoso
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al guardar el pago");
    }
  };

  if (!currentInstallment) return null;

  const totalPaid = payments?.reduce((sum, p) => sum + parseFloat(p.total_paid.toString()), 0) || 0;
  const pending = parseFloat(currentInstallment.pending_amount.toString());
  const isPaid = currentInstallment.status === "PAGADO";
  const canAddPayment = pending > 0 && !isPaid;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pagos de Cuota {currentInstallment.correlativo}
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
                <p className="font-semibold text-lg">{currentInstallment.installment_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      currentInstallment.status === "PAGADO"
                        ? "default"
                        : currentInstallment.status === "VENCIDO"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {currentInstallment.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha Vencimiento:</span>
                <p className="font-semibold">
                  {new Date(currentInstallment.due_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Monto Original:</span>
                <p className="font-bold text-lg">
                  {parseFloat(currentInstallment.amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Pagado:</span>
                <p className="font-bold text-primary text-lg">
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
              {canAddPayment ? (
                <Button onClick={handleAddPayment} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              ) : isPaid ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                    ✓ Esta cuota ha sido pagada completamente
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay saldo pendiente en esta cuota
                  </p>
                </div>
              )}
              <PurchasePaymentTable
                payments={payments || []}
                onEdit={handleEditPayment}
                onRefresh={() => currentInstallment && fetchPayments(currentInstallment.id)}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
