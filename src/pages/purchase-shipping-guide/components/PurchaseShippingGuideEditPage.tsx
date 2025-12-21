"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseShippingGuideForm } from "./PurchaseShippingGuideForm";
import { type PurchaseShippingGuideSchema } from "../lib/purchase-shipping-guide.schema";
import { usePurchaseShippingGuideStore } from "../lib/purchase-shipping-guide.store";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast } from "@/lib/core.function";

export const PurchaseShippingGuideEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { guide, fetchGuide, updateGuide, isFinding } = usePurchaseShippingGuideStore();

  useEffect(() => {
    if (id) {
      fetchGuide(Number(id));
    }
  }, [id]);

  const getDefaultValues = (): Partial<PurchaseShippingGuideSchema> => {
    if (!guide) {
      return {};
    }

    return {
      purchase_id: guide.purchase_id?.toString() || "",
      guide_number: guide.guide_number,
      issue_date: guide.issue_date,
      transfer_date: guide.transfer_date,
      motive: guide.motive,
      carrier_name: guide.carrier_name,
      carrier_ruc: guide.carrier_ruc,
      vehicle_plate: guide.vehicle_plate,
      driver_name: guide.driver_name,
      driver_license: guide.driver_license,
      origin_address: guide.origin_address,
      destination_address: guide.destination_address,
      total_weight: guide.total_weight,
      observations: guide.observations,
      status: guide.status,
      details: [],
    };
  };

  const handleSubmit = async (data: Partial<PurchaseShippingGuideSchema>) => {
    if (!guide || !id) return;

    setIsSubmitting(true);
    try {
      await updateGuide(Number(id), data);
      navigate("/guias-compra");
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al actualizar la guía");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinding || productsLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/guias-compra" />
            <TitleFormComponent title="Guía de Compra" mode="update" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!guide) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/guias-compra" />
          <TitleFormComponent title="Guía de Compra" mode="update" />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Guía no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/guias-compra" />
          <TitleFormComponent title="Guía de Compra" mode="update" />
        </div>
      </div>

      {products && products.length > 0 && (
        <PurchaseShippingGuideForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          products={products}
          onCancel={() => navigate("/guias-compra")}
        />
      )}
    </FormWrapper>
  );
};
