"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { type PurchaseSchema } from "../lib/purchase.schema";
import { usePurchaseStore } from "../lib/purchase.store";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllPurchaseOrders } from "@/pages/purchase-order/lib/purchase-order.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { PurchaseResource } from "../lib/purchase.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PurchaseDetailModal } from "./PurchaseDetailModal";
import { PurchaseDetailTable } from "./PurchaseDetailTable";
import { PurchaseInstallmentModal } from "./PurchaseInstallmentModal";
import { PurchaseInstallmentTable } from "./PurchaseInstallmentTable";
import { errorToast } from "@/lib/core.function";

export const PurchaseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [editingInstallmentId, setEditingInstallmentId] = useState<number | null>(null);

  const { user } = useAuthStore();
  const { data: suppliers, isLoading: suppliersLoading } = useAllSuppliers();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: purchaseOrders, isLoading: purchaseOrdersLoading } = useAllPurchaseOrders();

  const { updatePurchase, fetchPurchase, purchase, isFinding } = usePurchaseStore();
  const { fetchDetails, details } = usePurchaseDetailStore();
  const { fetchInstallments, installments } = usePurchaseInstallmentStore();

  const isLoading =
    suppliersLoading || warehousesLoading || productsLoading || purchaseOrdersLoading || isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/compras");
      return;
    }
    fetchPurchase(Number(id));
  }, [id, navigate, fetchPurchase]);

  useEffect(() => {
    if (id) {
      fetchDetails(Number(id));
      fetchInstallments(Number(id));
    }
  }, [id, fetchDetails, fetchInstallments]);

  const mapPurchaseToForm = (data: PurchaseResource): Partial<PurchaseSchema> => ({
    supplier_id: data.supplier_id?.toString(),
    warehouse_id: data.warehouse_id?.toString(),
    user_id: data.user_id?.toString(),
    purchase_order_id: data.purchase_order_id?.toString() || "",
    document_type: data.document_type,
    document_number: data.document_number,
    issue_date: data.issue_date,
    payment_type: data.payment_type,
    currency: data.currency,
    observations: data.observations,
    details: [],
    installments: [],
  });

  const handleSubmit = async (data: Partial<PurchaseSchema>) => {
    if (!purchase || !id) return;

    setIsSubmitting(true);
    try {
      await updatePurchase(Number(id), data);
      // El toast de éxito se muestra en el store
      navigate("/compras");
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al actualizar la compra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Detail handlers
  const handleAddDetail = () => {
    setEditingDetailId(null);
    setIsDetailModalOpen(true);
  };

  const handleEditDetail = (detailId: number) => {
    setEditingDetailId(detailId);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setEditingDetailId(null);
    if (id) {
      fetchDetails(Number(id));
      fetchPurchase(Number(id));
    }
  };

  // Installment handlers
  const handleAddInstallment = () => {
    setEditingInstallmentId(null);
    setIsInstallmentModalOpen(true);
  };

  const handleEditInstallment = (installmentId: number) => {
    setEditingInstallmentId(installmentId);
    setIsInstallmentModalOpen(true);
  };

  const handleInstallmentModalClose = () => {
    setIsInstallmentModalOpen(false);
    setEditingInstallmentId(null);
    if (id) {
      fetchInstallments(Number(id));
      fetchPurchase(Number(id));
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/compras" />
            <TitleFormComponent title="Compra" mode="edit" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!purchase) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/compras" />
          <TitleFormComponent title="Compra" mode="edit" />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Compra no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/compras" />
          <TitleFormComponent title="Compra" mode="edit" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Form */}
        {suppliers &&
          suppliers.length > 0 &&
          warehouses &&
          warehouses.length > 0 &&
          products &&
          products.length > 0 &&
          user && (
            <PurchaseForm
              defaultValues={mapPurchaseToForm(purchase)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              mode="update"
              suppliers={suppliers}
              warehouses={warehouses}
              products={products}
              purchaseOrders={purchaseOrders || []}
              purchase={purchase}
              currentUserId={user.id}
              onCancel={() => navigate("/compras")}
            />
          )}

        {/* Details Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalles de la Compra</CardTitle>
            <Button onClick={handleAddDetail}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Detalle
            </Button>
          </CardHeader>
          <CardContent>
            <PurchaseDetailTable
              details={details || []}
              onEdit={handleEditDetail}
              onRefresh={() => id && fetchDetails(Number(id))}
            />
          </CardContent>
        </Card>

        {/* Installments Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cuotas</CardTitle>
            <Button onClick={handleAddInstallment}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cuota
            </Button>
          </CardHeader>
          <CardContent>
            <PurchaseInstallmentTable
              installments={installments || []}
              onEdit={handleEditInstallment}
              onRefresh={() => id && fetchInstallments(Number(id))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {isDetailModalOpen && products && (
        <PurchaseDetailModal
          open={isDetailModalOpen}
          onClose={handleDetailModalClose}
          purchaseId={Number(id)}
          products={products}
          detailId={editingDetailId}
        />
      )}

      {isInstallmentModalOpen && (
        <PurchaseInstallmentModal
          open={isInstallmentModalOpen}
          onClose={handleInstallmentModalClose}
          purchaseId={Number(id)}
          installmentId={editingInstallmentId}
        />
      )}
    </FormWrapper>
  );
};
