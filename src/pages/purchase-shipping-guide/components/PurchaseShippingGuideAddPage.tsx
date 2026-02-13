"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseShippingGuideForm } from "./PurchaseShippingGuideForm";
import { type PurchaseShippingGuideSchema } from "../lib/purchase-shipping-guide.schema";
import { usePurchaseShippingGuideStore } from "../lib/purchase-shipping-guide.store";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast } from "@/lib/core.function";
import { PURCHASE_SHIPPING_GUIDE } from "../lib/purchase-shipping-guide.interface";

export const PurchaseShippingGuideAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ROUTE, ICON } = PURCHASE_SHIPPING_GUIDE;

  const { data: purchases, isLoading: purchasesLoading } = useAllPurchases();

  const { createGuide } = usePurchaseShippingGuideStore();

  const isLoading = purchasesLoading;

  const getDefaultValues = (): Partial<PurchaseShippingGuideSchema> => ({
    transport_modality: "PRIVADO",
    issue_date: new Date().toISOString().split("T")[0],
    transfer_start_date: new Date().toISOString().split("T")[0],
    remittent_id: "",
    recipient_id: "777",
    carrier_id: "",
    driver_id: "",
    driver_license: "",
    vehicle_id: "",
    origin_address: "",
    origin_ubigeo_id: "",
    destination_address: "",
    destination_ubigeo_id: "",
    observations: "",
    details: [],
  });

  const handleSubmit = async (data: PurchaseShippingGuideSchema) => {
    setIsSubmitting(true);
    try {
      await createGuide(data);
      navigate("/guias-compra");
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al crear la guía");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title="Guía de Compra"
          mode="create"
          icon={ICON}
          backRoute={ROUTE}
        />
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Guía de Compra"
        mode="create"
        icon={ICON}
        backRoute={ROUTE}
      />

      <PurchaseShippingGuideForm
        defaultValues={getDefaultValues()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={() => navigate("/guias-compra")}
      />
    </FormWrapper>
  );
};
