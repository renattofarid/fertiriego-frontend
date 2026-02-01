"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { QuotationForm } from "./QuotationForm";
import { useQuotationStore } from "../lib/quotation.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast, successToast } from "@/lib/core.function";
import { QUOTATION } from "../lib/quotation.interface";

export const QuotationAddPage = () => {
  const { ICON } = QUOTATION;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();

  const { createQuotation } = useQuotationStore();

  const isLoading = warehousesLoading;

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createQuotation(data);
      successToast("Cotización creada correctamente");
      navigate("/cotizaciones");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al crear la cotización",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Cotización" mode="create" icon={ICON} />
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
          <TitleFormComponent title="Cotización" mode="create" icon={ICON} />
        </div>
      </div>

      {warehouses && warehouses.length > 0 && (
        <QuotationForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/cotizaciones")}
          isSubmitting={isSubmitting}
          warehouses={warehouses}
        />
      )}
    </FormWrapper>
  );
};
