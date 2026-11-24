import { useState, useEffect } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen, CreditCard, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PurchaseResource } from "../../lib/purchase.interface";
import { usePurchaseDetailStore } from "../../lib/purchase-detail.store";
import { usePurchaseInstallmentStore } from "../../lib/purchase-installment.store";
import { usePurchaseStore } from "../../lib/purchase.store";
import { PurchaseDetailTable } from "../PurchaseDetailTable";
import { PurchaseInstallmentTable } from "../PurchaseInstallmentTable";
import { PurchaseDetailForm } from "../forms/PurchaseDetailForm";
import { PurchaseInstallmentForm } from "../forms/PurchaseInstallmentForm";
import {
  errorToast,
  matchCurrency,
  successToast,
} from "@/lib/core.function";
import { formatCurrency } from "@/lib/formatCurrency";

interface PurchaseManagementSheetProps {
  open: boolean;
  onClose: () => void;
  purchase: PurchaseResource | null;
  onPurchaseUpdate?: () => void;
}

export function PurchaseManagementSheet({
  open,
  onClose,
  purchase,
  onPurchaseUpdate,
}: PurchaseManagementSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [showInstallmentForm, setShowInstallmentForm] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState<
    number | null
  >(null);
  const [currentPurchase, setCurrentPurchase] =
    useState<PurchaseResource | null>(purchase);

  const { fetchPurchase } = usePurchaseStore();

  const {
    details,
    detail,
    fetchDetails,
    fetchDetail,
    createDetail,
    updateDetail,
    isSubmitting: detailSubmitting,
    resetDetail,
  } = usePurchaseDetailStore();

  const {
    installments,
    installment,
    fetchInstallments,
    fetchInstallment,
    createInstallment,
    updateInstallment,
    isSubmitting: installmentSubmitting,
    resetInstallment,
  } = usePurchaseInstallmentStore();

  useEffect(() => {
    if (purchase && open) {
      setCurrentPurchase(purchase);
      fetchDetails(purchase.id);
      fetchInstallments(purchase.id);
    }
  }, [purchase, open]);

  // Función para refrescar los datos de la compra
  const refreshPurchaseData = async () => {
    if (!purchase) return;

    try {
      await fetchPurchase(purchase.id);
      // Actualizar la compra localmente obteniendo los datos del store
      const { purchase: updatedPurchase } = usePurchaseStore.getState();
      if (updatedPurchase) {
        setCurrentPurchase(updatedPurchase);
      }
      onPurchaseUpdate?.(); // Notificar al componente padre
    } catch (error) {
      // Error manejado en el store
    }
  };

  useEffect(() => {
    if (editingDetailId) {
      fetchDetail(editingDetailId);
    } else {
      resetDetail();
    }
  }, [editingDetailId]);

  useEffect(() => {
    if (editingInstallmentId) {
      fetchInstallment(editingInstallmentId);
    } else {
      resetInstallment();
    }
  }, [editingInstallmentId]);

  const handleAddDetail = () => {
    setEditingDetailId(null);
    setShowDetailForm(true);
  };

  const handleEditDetail = (detailId: number) => {
    setEditingDetailId(detailId);
    setShowDetailForm(true);
  };

  const handleDetailSubmit = async (data: any) => {
    if (!purchase) return;

    try {
      if (editingDetailId) {
        await updateDetail(editingDetailId, data);
        successToast("Detalle actualizado exitosamente");
      } else {
        await createDetail({
          purchase_id: purchase.id,
          ...data,
        });
        successToast("Detalle agregado exitosamente");
      }
      setShowDetailForm(false);
      setEditingDetailId(null);
      fetchDetails(purchase.id);
      await refreshPurchaseData(); // Actualizar la compra y la información general
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al guardar el detalle",
      );
    }
  };

  const handleAddInstallment = () => {
    setEditingInstallmentId(null);
    setShowInstallmentForm(true);
  };

  const handleEditInstallment = (installmentId: number) => {
    setEditingInstallmentId(installmentId);
    setShowInstallmentForm(true);
  };

  const handleInstallmentSubmit = async (data: any) => {
    if (!purchase) return;

    try {
      if (editingInstallmentId) {
        await updateInstallment(editingInstallmentId, data);
        successToast("Cuota actualizada exitosamente");
      } else {
        await createInstallment({
          purchase_id: purchase.id,
          ...data,
        });
        successToast("Cuota agregada exitosamente");
      }
      setShowInstallmentForm(false);
      setEditingInstallmentId(null);
      fetchInstallments(purchase.id);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al guardar la cuota");
    }
  };

  const handleSyncInstallment = async (
    installmentId: number,
    newAmount: number,
  ) => {
    if (!purchase) return;

    try {
      await updateInstallment(installmentId, {
        amount: Number(newAmount.toFixed(2)),
      });
      successToast("Cuota sincronizada exitosamente");
      fetchInstallments(purchase.id);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al sincronizar la cuota",
      );
    }
  };

  if (!currentPurchase) return null;

  // Determinar si se pueden agregar detalles o cuotas
  const isPaid =
    currentPurchase.status === "PAGADA" || currentPurchase.status === "PAGADO";
  const isCash = currentPurchase.payment_type === "CONTADO";
  const totalAmount = parseFloat(currentPurchase.total_amount) || 0;
  const pendingAmount = parseFloat(currentPurchase.current_amount) || 0;
  const hasPayments = totalAmount !== pendingAmount;
  const paidAmount = Math.max(0, totalAmount - pendingAmount);
  const paidPercent =
    totalAmount > 0
      ? Math.min(100, Math.round((paidAmount / totalAmount) * 100))
      : 0;
  const currencySymbol = matchCurrency(currentPurchase.currency || "PEN");
  const statusVariant = isPaid
    ? "default"
    : currentPurchase.status === "CANCELADO"
      ? "destructive"
      : "secondary";

  // Para detalles: NO se puede si está pagada O (es al contado Y tiene pagos)
  const canAddDetails = !isPaid && !(isCash && hasPayments);

  // Para cuotas: NO se puede si está pagada O es al contado
  const canAddInstallments = !isPaid && !isCash;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Gestión de Compra ${currentPurchase.correlativo}`}
      subtitle="Administra los detalles, cuotas y pagos de esta compra"
      icon="PackageOpen"
      size="6xl"
    >
      <div className="space-y-3">
          {/* Resumen financiero */}
          <section
            aria-label="Resumen de la compra"
            className="rounded-md border border-muted bg-background p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Proveedor</p>
                <p className="text-base font-semibold">
                  {currentPurchase.supplier_fullname}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {currentPurchase.document_type}{" "}
                  {currentPurchase.document_number}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={statusVariant}>{currentPurchase.status}</Badge>
                <Badge variant="outline">{currentPurchase.payment_type}</Badge>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd className="text-xl font-bold tabular-nums">
                  {formatCurrency(totalAmount, { currencySymbol })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Pagado</dt>
                <dd className="text-xl font-bold tabular-nums text-primary">
                  {formatCurrency(paidAmount, { currencySymbol })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Saldo pendiente
                </dt>
                <dd
                  className={`text-xl font-bold tabular-nums ${
                    pendingAmount > 0
                      ? "text-orange-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatCurrency(pendingAmount, { currencySymbol })}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={paidPercent}
                aria-label="Porcentaje pagado"
                className="h-2 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                {paidPercent}% pagado
              </p>
            </div>
          </section>

          {/* Tabs para Detalles y Cuotas */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <PackageOpen className="h-4 w-4" />
                Detalles
                <span className="tabular-nums text-muted-foreground">
                  ({details?.length || 0})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="installments"
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Cuotas
                <span className="tabular-nums text-muted-foreground">
                  ({installments?.length || 0})
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-3 space-y-3">
              {showDetailForm ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingDetailId ? "Editar Detalle" : "Agregar Detalle"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PurchaseDetailForm
                      detail={editingDetailId ? detail : null}
                      onSubmit={handleDetailSubmit}
                      onCancel={() => {
                        setShowDetailForm(false);
                        setEditingDetailId(null);
                      }}
                      isSubmitting={detailSubmitting}
                    />
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Button
                    onClick={handleAddDetail}
                    className="w-full active:scale-[0.97] transition-[color,background-color,transform] duration-150 ease-out motion-reduce:transform-none"
                    disabled={!canAddDetails}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Detalle
                  </Button>
                  {!canAddDetails && (
                    <p className="text-sm text-muted-foreground text-center">
                      {isPaid
                        ? "No se pueden agregar detalles a una compra pagada"
                        : "No se pueden agregar detalles a pagos al contado con pagos registrados"}
                    </p>
                  )}
                  <PurchaseDetailTable
                    purchaseId={purchase?.id}
                    onEdit={handleEditDetail}
                    onRefresh={async () => {
                      if (purchase) {
                        fetchDetails(purchase.id);
                        await refreshPurchaseData(); // Actualizar la compra y la información general
                      }
                    }}
                    isPurchasePaid={isPaid || (isCash && hasPayments)}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="installments" className="mt-3 space-y-3">
              {showInstallmentForm ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingInstallmentId ? "Editar Cuota" : "Agregar Cuota"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PurchaseInstallmentForm
                      installment={editingInstallmentId ? installment : null}
                      onSubmit={handleInstallmentSubmit}
                      onCancel={() => {
                        setShowInstallmentForm(false);
                        setEditingInstallmentId(null);
                      }}
                      isSubmitting={installmentSubmitting}
                    />
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Button
                    onClick={handleAddInstallment}
                    className="w-full active:scale-[0.97] transition-[color,background-color,transform] duration-150 ease-out motion-reduce:transform-none"
                    disabled={!canAddInstallments}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cuota
                  </Button>
                  {!canAddInstallments && (
                    <p className="text-sm text-muted-foreground text-center">
                      {isPaid
                        ? "No se pueden agregar cuotas a una compra pagada"
                        : "No se pueden agregar cuotas a pagos al contado"}
                    </p>
                  )}

                  {/* Advertencia de desincronización */}
                  {isCash &&
                    installments &&
                    installments.length > 0 &&
                    (() => {
                      const installmentAmount = parseFloat(
                        installments[0]?.amount || "0",
                      );
                      const hasNoPayments =
                        parseFloat(installments[0]?.pending_amount || "0") ===
                        installmentAmount;
                      const hasDifference =
                        Math.abs(installmentAmount - totalAmount) > 0.01;

                      if (hasNoPayments && hasDifference) {
                        return (
                          <div
                            role="alert"
                            className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950"
                          >
                            <TriangleAlert
                              className="mt-0.5 size-4 shrink-0 text-orange-600"
                              aria-hidden
                            />
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                              La cuota (
                              <span className="font-semibold tabular-nums">
                                {formatCurrency(installmentAmount, {
                                  currencySymbol,
                                })}
                              </span>
                              ) no coincide con el total de la compra (
                              <span className="font-semibold tabular-nums">
                                {formatCurrency(totalAmount, { currencySymbol })}
                              </span>
                              ). Sincronízala con el botón de actualizar de la
                              tabla.
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}

                  <PurchaseInstallmentTable
                    installments={installments || []}
                    onEdit={handleEditInstallment}
                    onRefresh={() => purchase && fetchInstallments(purchase.id)}
                    isCashPayment={isCash}
                    purchaseTotalAmount={totalAmount}
                    onSyncInstallment={handleSyncInstallment}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
    </GeneralSheet>
  );
}
