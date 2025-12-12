"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { QuotationForm } from "./QuotationForm";
import { useQuotationStore } from "../lib/quotation.store";
import { useClients } from "@/pages/client/lib/client.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast, successToast } from "@/lib/core.function";
import {
  QUOTATION,
  type UpdateQuotationRequest,
} from "../lib/quotation.interface";

export const QuotationEditPage = () => {
  const { ICON } = QUOTATION;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers, isLoading: customersLoading } = useClients();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();

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

  const isLoading =
    customersLoading || warehousesLoading || productsLoading || isFinding;

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
        err.response?.data?.message || "Error al actualizar la cotización"
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
            <TitleFormComponent title="Cotización" mode="edit" icon={ICON} />
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
            <TitleFormComponent title="Cotización" mode="edit" icon={ICON} />
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No se encontró la cotización
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Cotización" mode="edit" icon={ICON} />
        </div>
      </div>

      {customers &&
        customers.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 && (
          <QuotationForm
            mode="edit"
            initialData={quotation}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/cotizaciones")}
            isSubmitting={isSubmitting}
            customers={customers}
            warehouses={warehouses}
            products={products}
          />
        )}
    </FormWrapper>
  );
};
