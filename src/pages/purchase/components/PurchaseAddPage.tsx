"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { type PurchaseSchema } from "../lib/purchase.schema";
import { usePurchaseStore } from "../lib/purchase.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { PURCHASE } from "../lib/purchase.interface";
import { useSidebar } from "@/components/ui/sidebar";

export const PurchaseAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ICON } = PURCHASE;
  const { user } = useAuthStore();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { setOpen, setOpenMobile } = useSidebar();
  const { createPurchase } = usePurchaseStore();

  const isLoading = warehousesLoading;

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

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

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
      <PageWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Compra" mode="create" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Compra" mode="create" icon={ICON} />
        </div>
      </div>

      {warehouses && warehouses.length > 0 && user && (
        <PurchaseForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          warehouses={warehouses}
          currentUserId={user.id}
          onCancel={() => navigate("/compras")}
        />
      )}
    </PageWrapper>
  );
};
