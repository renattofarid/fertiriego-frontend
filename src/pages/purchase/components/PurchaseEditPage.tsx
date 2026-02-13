"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { type PurchaseSchema } from "../lib/purchase.schema";
import { usePurchaseStore } from "../lib/purchase.store";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllPurchaseOrders } from "@/pages/purchase-order/lib/purchase-order.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { PURCHASE, type PurchaseResource } from "../lib/purchase.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast } from "@/lib/core.function";

export const PurchaseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ICON } = PURCHASE;

  const { user } = useAuthStore();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: purchaseOrders, isLoading: purchaseOrdersLoading } =
    useAllPurchaseOrders();

  const { updatePurchase, fetchPurchase, purchase, isFinding } =
    usePurchaseStore();
  const { fetchDetails, details } = usePurchaseDetailStore();
  const { fetchInstallments, installments } = usePurchaseInstallmentStore();

  const isLoading = warehousesLoading || purchaseOrdersLoading || isFinding;

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

  const mapPurchaseToForm = (
    data: PurchaseResource,
  ): Partial<PurchaseSchema> => ({
    supplier_id: data.supplier_id?.toString(),
    warehouse_id: data.warehouse_id?.toString(),
    user_id: data.user_id?.toString(),
    purchase_order_id: data.purchase_order_id?.toString() || "",
    document_type: data.document_type,
    document_number: data.document_number,
    issue_date: data.issue_date,
    payment_type: data.payment_type,
    currency: data.currency,
    observations: data.observations ?? "",
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
      errorToast(
        error.response?.data?.message || "Error al actualizar la compra",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers para refrescar datos
  const handleRefreshDetails = () => {
    if (id) {
      fetchDetails(Number(id));
      fetchPurchase(Number(id));
    }
  };

  const handleRefreshInstallments = () => {
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
            <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
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
          <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
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
          <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
        </div>
      </div>

      {warehouses && warehouses.length > 0 && user && (
        <PurchaseForm
          defaultValues={mapPurchaseToForm(purchase)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
          warehouses={warehouses}
          purchaseOrders={purchaseOrders || []}
          purchase={purchase}
          currentUserId={user.id}
          onCancel={() => navigate("/compras")}
          purchaseId={Number(id)}
          detailsFromStore={details || []}
          installmentsFromStore={installments || []}
          onRefreshDetails={handleRefreshDetails}
          onRefreshInstallments={handleRefreshInstallments}
        />
      )}
    </FormWrapper>
  );
};
