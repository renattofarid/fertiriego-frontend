"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { QuotationForm } from "./QuotationForm";
import { useQuotationStore } from "../lib/quotation.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast, successToast } from "@/lib/core.function";
import { QUOTATION, type QuotationResource } from "../lib/quotation.interface";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export const QuotationAddPage = () => {
  const { ICON } = QUOTATION;
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateFrom = (location.state as { duplicateFrom?: QuotationResource } | null)?.duplicateFrom;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { createQuotation } = useQuotationStore();
  const { setOpen, setOpenMobile } = useSidebar();
  const isLoading = warehousesLoading;

  const buildDuplicateInitialData = (source: QuotationResource): QuotationResource => ({
    ...source,
    fecha_emision: new Date().toISOString().split("T")[0],
    status: "Pendiente",
  });

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

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Cotización" mode="create" icon={ICON} />
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
          <TitleFormComponent title="Cotización" mode="create" icon={ICON} />
        </div>
      </div>

      {warehouses && warehouses.length > 0 && (
        <QuotationForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/cotizaciones")}
          isSubmitting={isSubmitting}
          warehouses={warehouses}
          initialData={duplicateFrom ? buildDuplicateInitialData(duplicateFrom) : undefined}
        />
      )}
    </PageWrapper>
  );
};
