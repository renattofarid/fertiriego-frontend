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

export const PurchaseShippingGuideAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: purchases, isLoading: purchasesLoading } = useAllPurchases();

  const { createGuide } = usePurchaseShippingGuideStore();

  const isLoading = purchasesLoading;

  const getDefaultValues = (): Partial<PurchaseShippingGuideSchema> => ({
    purchase_id: "",
    guide_number: "",
    issue_date: new Date().toISOString().split("T")[0],
    transfer_date: new Date().toISOString().split("T")[0],
    motive: "",
    carrier_name: "",
    carrier_ruc: "",
    vehicle_plate: "",
    driver_name: "",
    driver_license: "",
    origin_address: "",
    destination_address: "",
    total_weight: "",
    observations: "",
    status: "EMITIDA",
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
          icon="Truck"
          handleBack={() => navigate("/guias-compra")}
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
        icon="Truck"
        handleBack={() => navigate("/guias-compra")}
      />

      <PurchaseShippingGuideForm
        defaultValues={getDefaultValues()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        purchases={purchases || []}
        onCancel={() => navigate("/guias-compra")}
      />
    </FormWrapper>
  );
};
