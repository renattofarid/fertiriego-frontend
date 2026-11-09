import { parseLocalDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PurchaseInstallmentResource } from "../../lib/purchase.interface";
import { usePurchasePaymentStore } from "../../lib/purchase-payment.store";
import { usePurchaseInstallmentStore } from "../../lib/purchase-installment.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { PurchasePaymentTable } from "../PurchasePaymentTable";
import { PurchasePaymentForm } from "../forms/PurchasePaymentForm";
import { errorToast, matchCurrency, successToast } from "@/lib/core.function";
import { formatCurrency } from "@/lib/formatCurrency";
import GeneralSheet from "@/components/GeneralSheet";
import { GroupFormSection } from "@/components/GroupFormSection";

// Sin per_page el backend pagina el historial y el total/lista quedaban incompletos
const PAYMENTS_PER_PAGE = 100;

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
    isLoading: isLoadingPayments,
    resetPayment,
  } = usePurchasePaymentStore();

  const {
    installment: updatedInstallment,
    isFinding: isLoadingInstallment,
    fetchInstallment,
  } = usePurchaseInstallmentStore();

  useEffect(() => {
    if (installment && open) {
      setCurrentInstallment(installment);
      fetchPayments(installment.id, { per_page: PAYMENTS_PER_PAGE });
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
      await fetchPayments(installment.id, { per_page: PAYMENTS_PER_PAGE });
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

  const pending = parseFloat(currentInstallment.pending_amount.toString());
  const totalPaid = Math.max(
    0,
    parseFloat(currentInstallment.amount) - pending,
  );
  const isPaid = currentInstallment.status === "PAGADO";
  const currencySymbol = matchCurrency(currentInstallment.currency || "PEN");
  const canAddPayment = pending > 0 && !isPaid;
  const purchase = currentInstallment.purchase;
  const purchaseLabel = [
    currentInstallment.purchase_correlativo,
    purchase?.document_type && purchase?.document_number
      ? `${purchase.document_type} ${purchase.document_number}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Pagos de Cuota ${currentInstallment.correlativo}`}
      subtitle="Gestiona los pagos realizados a esta cuota"
      icon="Wallet"
      size="4xl"
    >
      <div className="space-y-3">
        {/* Información de la Cuota */}
        <GroupFormSection
          title="Información de la Cuota"
          icon={Wallet}
          cols={{ sm: 2, md: 3, lg: 3 }}
          gap="gap-2"
        >
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Cuota #</span>
            <p className="font-semibold">{currentInstallment.installment_number}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Estado</span>
            <div>
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
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Fecha Vencimiento</span>
            <p className="font-semibold text-sm">
              {parseLocalDate(currentInstallment.due_date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Monto Original</span>
            <p className="font-bold text-base tabular-nums">
              {isLoadingInstallment ? (
                <span
                  aria-hidden
                  className="inline-block h-5 w-24 animate-pulse rounded-md bg-accent align-middle"
                />
              ) : (
                formatCurrency(parseFloat(currentInstallment.amount), { currencySymbol })
              )}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Total Pagado</span>
            <p className="font-bold text-primary text-base tabular-nums">
              {isLoadingInstallment ? (
                <span
                  aria-hidden
                  className="inline-block h-5 w-24 animate-pulse rounded-md bg-accent align-middle"
                />
              ) : (
                formatCurrency(totalPaid, { currencySymbol })
              )}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Saldo Pendiente</span>
            <p
              className={`font-bold text-base tabular-nums ${
                pending > 0 ? "text-orange-600" : "text-muted-foreground"
              }`}
            >
              {isLoadingInstallment ? (
                <span
                  aria-hidden
                  className="inline-block h-5 w-24 animate-pulse rounded-md bg-accent align-middle"
                />
              ) : (
                formatCurrency(pending, { currencySymbol })
              )}
            </p>
          </div>
          {(purchaseLabel || purchase?.supplier_name) && (
            <div className="col-span-full space-y-1 border-t pt-2">
              <span className="text-xs text-muted-foreground">Compra</span>
              <p className="text-sm font-semibold">{purchaseLabel}</p>
              {purchase?.supplier_name && (
                <p className="text-sm text-muted-foreground">
                  {purchase.supplier_name}
                </p>
              )}
            </div>
          )}
        </GroupFormSection>

        {/* Formulario o Tabla de Pagos */}
        {showPaymentForm ? (
          <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none">
          <GroupFormSection
            title={editingPaymentId ? "Editar Pago" : "Registrar Pago"}
            icon={Plus}
            cols={{ sm: 1 }}
          >
            <div className="col-span-full">
              <PurchasePaymentForm
                payment={editingPaymentId ? payment : null}
                onSubmit={handlePaymentSubmit}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setEditingPaymentId(null);
                }}
                isSubmitting={isSubmitting}
                pending={editingPaymentId ? undefined : pending}
              />
            </div>
          </GroupFormSection>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none">
            {canAddPayment ? (
              <Button
                onClick={handleAddPayment}
                className="w-full active:scale-[0.97] transition-[color,background-color,transform] duration-150 ease-out motion-reduce:transform-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            ) : isPaid ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                <p className="text-sm font-semibold text-primary">
                  Esta cuota ha sido pagada completamente
                </p>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay saldo pendiente en esta cuota
                </p>
              </div>
            )}
            <PurchasePaymentTable
              payments={payments || []}
              installmentAmount={parseFloat(currentInstallment.amount)}
              currencySymbol={currencySymbol}
              onEdit={handleEditPayment}
              isLoading={isLoadingPayments}
              onRefresh={() =>
                currentInstallment &&
                fetchPayments(currentInstallment.id, { per_page: PAYMENTS_PER_PAGE })
              }
            />
          </div>
        )}
      </div>
    </GeneralSheet>
  );
}
