"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { QuotationForm } from "./QuotationForm";
import { useQuotationStore } from "../lib/quotation.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast, successToast } from "@/lib/core.function";
import {
  QUOTATION,
  type UpdateQuotationRequest,
} from "../lib/quotation.interface";
import PageWrapper from "@/components/PageWrapper";

export const QuotationEditPage = () => {
  const { ICON } = QUOTATION;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();

  const {
    quotation,
    fetchQuotation,
    isFinding,
    updateQuotation: updateQuotationStore,
  } = useQuotationStore();

  useEffect(() => {
    if (id) {
      fetchQuotation(parseInt(id));
    }
  }, [id, fetchQuotation]);

  const isLoading = warehousesLoading || isFinding;

  const handleSubmit = async (data: UpdateQuotationRequest) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateQuotationStore(parseInt(id), data);
      successToast("Cotización actualizada correctamente");
      navigate("/cotizaciones");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      errorToast(
        err.response?.data?.message || "Error al actualizar la cotización",
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
            <TitleFormComponent title="Cotización" mode="update" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!quotation) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Cotización" mode="update" icon={ICON} />
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No se encontró la cotización
        </div>
      </FormWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Cotización" mode="update" icon={ICON} />
        </div>
      </div>

      {warehouses && warehouses.length > 0 && (
        <QuotationForm
          mode="update"
          initialData={quotation}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/cotizaciones")}
          isSubmitting={isSubmitting}
          warehouses={warehouses}
        />
      )}
    </PageWrapper>
  );
};
