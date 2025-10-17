import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PurchaseResource } from "../../lib/purchase.interface";
import { usePurchaseDetailStore } from "../../lib/purchase-detail.store";
import { usePurchaseInstallmentStore } from "../../lib/purchase-installment.store";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { PurchaseDetailTable } from "../PurchaseDetailTable";
import { PurchaseInstallmentTable } from "../PurchaseInstallmentTable";
import { PurchaseDetailForm } from "../forms/PurchaseDetailForm";
import { PurchaseInstallmentForm } from "../forms/PurchaseInstallmentForm";
import { errorToast, successToast } from "@/lib/core.function";

interface PurchaseManagementSheetProps {
  open: boolean;
  onClose: () => void;
  purchase: PurchaseResource | null;
}

export function PurchaseManagementSheet({
  open,
  onClose,
  purchase,
}: PurchaseManagementSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [showInstallmentForm, setShowInstallmentForm] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState<number | null>(null);

  const { data: products } = useAllProducts();

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
      fetchDetails(purchase.id);
      fetchInstallments(purchase.id);
    }
  }, [purchase, open]);

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
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al guardar el detalle");
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

  if (!purchase) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PackageOpen className="h-5 w-5" />
            Gestión de Compra {purchase.correlativo}
          </SheetTitle>
          <SheetDescription>
            Administra los detalles, cuotas y pagos de esta compra
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información General</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Proveedor:</span>
                <p className="font-semibold">{purchase.supplier_fullname}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Documento:</span>
                <p className="font-semibold">
                  {purchase.document_type} - {purchase.document_number}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <p className="font-bold text-green-600 text-lg">
                  {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {parseFloat(purchase.total_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Saldo:</span>
                <p className="font-bold text-orange-600 text-lg">
                  {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {parseFloat(purchase.current_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      purchase.status === "PAGADO"
                        ? "default"
                        : purchase.status === "CANCELADO"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {purchase.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de Pago:</span>
                <div className="mt-1">
                  <Badge
                    variant={purchase.payment_type === "CONTADO" ? "default" : "secondary"}
                  >
                    {purchase.payment_type}
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
              <TabsTrigger value="installments" className="flex items-center gap-2">
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
                    {products && (
                      <PurchaseDetailForm
                        products={products}
                        detail={editingDetailId ? detail : null}
                        onSubmit={handleDetailSubmit}
                        onCancel={() => {
                          setShowDetailForm(false);
                          setEditingDetailId(null);
                        }}
                        isSubmitting={detailSubmitting}
                      />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Button onClick={handleAddDetail} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Detalle
                  </Button>
                  <PurchaseDetailTable
                    details={details || []}
                    onEdit={handleEditDetail}
                    onRefresh={() => purchase && fetchDetails(purchase.id)}
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
                  <Button onClick={handleAddInstallment} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cuota
                  </Button>
                  <PurchaseInstallmentTable
                    installments={installments || []}
                    onEdit={handleEditInstallment}
                    onRefresh={() => purchase && fetchInstallments(purchase.id)}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
