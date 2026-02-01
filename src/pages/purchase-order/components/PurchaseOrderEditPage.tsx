"use client";

import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import { type PurchaseOrderSchema } from "../lib/purchase-order.schema";
import { usePurchaseOrderStore } from "../lib/purchase-order.store";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import {
  PURCHASE_ORDER,
  type PurchaseOrderResource,
} from "../lib/purchase-order.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";

export default function PurchaseOrderEditPage() {
  const { MODEL, ICON } = PURCHASE_ORDER;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  const { data: suppliers, isLoading: suppliersLoading } = useAllSuppliers();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();

  const {
    updatePurchaseOrder,
    fetchPurchaseOrder,
    purchaseOrder,
    isFinding,
    isSubmitting,
  } = usePurchaseOrderStore();

  const isLoading = suppliersLoading || warehousesLoading || isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/ordenes-compra");
      return;
    }

    fetchPurchaseOrder(Number(id));
  }, [id, navigate, fetchPurchaseOrder]);

  const mapPurchaseOrderToForm = (
    data: PurchaseOrderResource,
  ): Partial<PurchaseOrderSchema> => ({
    supplier_id: data.supplier_id?.toString(),
    warehouse_id: data.warehouse_id?.toString(),
    issue_date: data.issue_date,
    expected_date: data.expected_date,
    observations: data.observations,
    details: [],
    // Coerce apply_igv to boolean in case backend sends 0/1 or similar
    apply_igv: Boolean((data as any).apply_igv ?? false),
  });

  const handleSubmit = async (data: Partial<PurchaseOrderSchema>) => {
    if (!purchaseOrder || !id) return;

    // Doble protección: ref inmediato + estado del store
    if (isSubmittingRef.current || isSubmitting) return;

    isSubmittingRef.current = true;

    try {
      await updatePurchaseOrder(Number(id), data);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      // Navegar después de un breve delay para que el usuario vea el toast
      setTimeout(() => {
        navigate("/ordenes-compra");
      }, 500);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "update"),
      );
      // Solo resetear el ref en caso de error (en éxito, navega)
      isSubmittingRef.current = false;
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!purchaseOrder) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Orden de compra no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
      </div>

      {suppliers &&
        suppliers.length > 0 &&
        warehouses &&
        warehouses.length > 0 && (
          <PurchaseOrderForm
            defaultValues={mapPurchaseOrderToForm(purchaseOrder)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="update"
            suppliers={suppliers}
            warehouses={warehouses}
            purchaseOrder={purchaseOrder}
            onCancel={() => navigate("/ordenes-compra")}
          />
        )}
    </FormWrapper>
  );
}
