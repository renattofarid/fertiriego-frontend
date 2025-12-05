"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { type PurchaseSchema } from "../lib/purchase.schema";
import { usePurchaseStore } from "../lib/purchase.store";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllPurchaseOrders } from "@/pages/purchase-order/lib/purchase-order.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { PURCHASE } from "../lib/purchase.interface";

export const PurchaseAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ICON } = PURCHASE;
  const { user } = useAuthStore();
  const { data: suppliers, isLoading: suppliersLoading } = useAllSuppliers();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: purchaseOrders, isLoading: purchaseOrdersLoading } =
    useAllPurchaseOrders();

  const { createPurchase } = usePurchaseStore();

  const isLoading =
    suppliersLoading ||
    warehousesLoading ||
    productsLoading ||
    purchaseOrdersLoading;

  const getDefaultValues = (): Partial<PurchaseSchema> => ({
    supplier_id: "",
    warehouse_id: "",
    user_id: user?.id?.toString() || "",
    purchase_order_id: "",
    document_type: "",
    document_number: "",
    issue_date: "",
    payment_type: "",
    currency: "PEN",
    observations: "",
    details: [],
    installments: [],
  });

  const handleSubmit = async (data: PurchaseSchema) => {
    setIsSubmitting(true);
    try {
      await createPurchase(data);
      successToast("Compra creada correctamente");
      navigate("/compras");
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Compra" mode="create" icon={ICON} />
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
          <TitleFormComponent title="Compra" mode="create" icon={ICON} />
        </div>
      </div>

      {suppliers &&
        suppliers.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 &&
        user && (
          <PurchaseForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            suppliers={suppliers}
            warehouses={warehouses}
            products={products}
            purchaseOrders={purchaseOrders || []}
            currentUserId={user.id}
            onCancel={() => navigate("/compras")}
          />
        )}
    </FormWrapper>
  );
};
