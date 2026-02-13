import { useState, useEffect } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen, CreditCard } from "lucide-react";
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
import { errorToast, successToast } from "@/lib/core.function";

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
  const isPaid = currentPurchase.status === "PAGADO";
  const isCash = currentPurchase.payment_type === "CONTADO";
  const hasPayments =
    parseFloat(currentPurchase.total_amount) !==
    parseFloat(currentPurchase.current_amount);

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
      size="4xl"
    >
      <div className="space-y-4">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información General</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Proveedor:</span>
                <p className="font-semibold">
                  {currentPurchase.supplier_fullname}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Documento:</span>
                <p className="font-semibold">
                  {currentPurchase.document_type} -{" "}
                  {currentPurchase.document_number}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <p className="font-bold text-primary text-lg">
                  {currentPurchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {parseFloat(currentPurchase.total_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Saldo:</span>
                <p className="font-bold text-orange-600 text-lg">
                  {currentPurchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {parseFloat(currentPurchase.current_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      currentPurchase.status === "PAGADA"
                        ? "default"
                        : currentPurchase.status === "CANCELADO"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {currentPurchase.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de Pago:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      currentPurchase.payment_type === "CONTADO"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {currentPurchase.payment_type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs para Detalles y Cuotas */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <PackageOpen className="h-4 w-4" />
                Detalles ({details?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="installments"
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Cuotas ({installments?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
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
                    className="w-full"
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
                    details={details || []}
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

            <TabsContent value="installments" className="space-y-4 mt-4">
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
                    className="w-full"
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
                      const totalAmount = parseFloat(
                        currentPurchase.total_amount,
                      );
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
                          <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                              ⚠️ La cuota ({installmentAmount.toFixed(2)}) no
                              coincide con el total de la compra (
                              {totalAmount.toFixed(2)}). Debe sincronizar la
                              cuota usando el botón 🔄
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
                    purchaseTotalAmount={parseFloat(
                      currentPurchase.total_amount,
                    )}
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
