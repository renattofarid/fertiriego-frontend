"use client";

import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import { type PurchaseOrderSchema } from "../lib/purchase-order.schema";
import { usePurchaseOrderStore } from "../lib/purchase-order.store";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PURCHASE_ORDER } from "../lib/purchase-order.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL } = PURCHASE_ORDER;

export default function PurchaseOrderAddPage() {
  const navigate = useNavigate();

  const { data: suppliers, isLoading: suppliersLoading } = useAllSuppliers();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  const { createPurchaseOrder, isSubmitting } = usePurchaseOrderStore();

  const isLoading = suppliersLoading || warehousesLoading || productsLoading;

  const getDefaultValues = (): Partial<PurchaseOrderSchema> => ({
    supplier_id: "",
    warehouse_id: "",
    order_number: "",
    issue_date: "",
    expected_date: "",
    observations: "",
    details: [],
  });

  const handleSubmit = async (data: PurchaseOrderSchema) => {
    if (isSubmitting) return; // Prevenir múltiples envíos

    try {
      await createPurchaseOrder(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      // Navegar después de un breve delay para que el usuario vea el toast
      setTimeout(() => {
        navigate("/ordenes-compra");
      }, 500);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "create")
      );
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/ordenes-compra" />
            <TitleFormComponent title={MODEL.name} mode="create" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/ordenes-compra" />
          <TitleFormComponent title={MODEL.name} mode="create" />
        </div>
      </div>

      {suppliers &&
        suppliers.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 && (
          <PurchaseOrderForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            suppliers={suppliers}
            warehouses={warehouses}
            products={products}
            onCancel={() => navigate("/ordenes-compra")}
          />
        )}
    </FormWrapper>
  );
}
