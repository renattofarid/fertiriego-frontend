"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseShippingGuideForm } from "./PurchaseShippingGuideForm";
import { type PurchaseShippingGuideSchema } from "../lib/purchase-shipping-guide.schema";
import { usePurchaseShippingGuideStore } from "../lib/purchase-shipping-guide.store";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast } from "@/lib/core.function";

export const PurchaseShippingGuideAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: purchases, isLoading: purchasesLoading } = useAllPurchases();

  const { createGuide } = usePurchaseShippingGuideStore();

  const isLoading = productsLoading || purchasesLoading;

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
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/guias-compra" />
            <TitleFormComponent title="Guía de Compra" mode="create" />
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
          <BackButton to="/guias-compra" />
          <TitleFormComponent title="Guía de Compra" mode="create" />
        </div>
      </div>

      {products && products.length > 0 && (
        <PurchaseShippingGuideForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          products={products}
          purchases={purchases || []}
          onCancel={() => navigate("/guias-compra")}
        />
      )}
    </FormWrapper>
  );
};
