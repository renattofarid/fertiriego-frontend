"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseShippingGuideForm } from "./PurchaseShippingGuideForm";
import { type PurchaseShippingGuideSchema } from "../lib/purchase-shipping-guide.schema";
import { usePurchaseShippingGuideStore } from "../lib/purchase-shipping-guide.store";
import FormWrapper from "@/components/FormWrapper";
import { errorToast } from "@/lib/core.function";
import { PURCHASE_SHIPPING_GUIDE } from "../lib/purchase-shipping-guide.interface";

export const PurchaseShippingGuideAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ROUTE, ICON } = PURCHASE_SHIPPING_GUIDE;
  const { createGuide } = usePurchaseShippingGuideStore();

  const getDefaultValues = (): Partial<PurchaseShippingGuideSchema> => ({
    issue_date: new Date().toISOString().split("T")[0],
    transfer_date: new Date().toISOString().split("T")[0],
    motive: "",
    carrier_id: "",
    carrier_name: "",
    carrier_ruc: "",
    driver_id: "",
    driver_name: "",
    driver_license: "",
    vehicle_id: "",
    vehicle_plate: "",
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
