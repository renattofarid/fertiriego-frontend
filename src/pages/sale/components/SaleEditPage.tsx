"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { SaleForm } from "./SaleForm";
import { type SaleUpdateSchema } from "../lib/sale.schema";
import { useSaleStore } from "../lib/sales.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { SALE, type SaleResource } from "../lib/sale.interface";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { format, parse } from "date-fns";
import { useSidebar } from "@/components/ui/sidebar";
import PageWrapper from "@/components/PageWrapper";

export const SaleEditPage = () => {
  const { ICON, MODEL } = SALE;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();

  const { updateSale, fetchSale, sale, isFinding } = useSaleStore();

  const { setOpen, setOpenMobile } = useSidebar();
  const isLoading = warehousesLoading || isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/ventas");
      return;
    }
    fetchSale(Number(id));
  }, [id, navigate, fetchSale]);

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  // Validar que la venta no tenga pagos registrados en sus cuotas
  useEffect(() => {
    if (sale) {
      // Verificar si alguna cuota tiene pagos registrados
      const hasPayments =
        sale.installments?.some((inst) => inst.pending_amount < inst.amount) ??
        false;

      if (hasPayments) {
        errorToast(
          "No se puede editar una venta que ya tiene pagos registrados",
        );
        navigate("/ventas");
      }
    }
  }, [sale, navigate]);

  const mapSaleToForm = (data: SaleResource): Partial<SaleUpdateSchema> => ({
    customer_id: data.customer_id?.toString(),
    warehouse_id: data.warehouse_id?.toString(),
    document_type: data.document_type,
    issue_date: format(
      parse(data.issue_date, "yyyy-MM-dd", new Date()),
      "yyyy-MM-dd",
    ),
    payment_type: data.payment_type,
    currency: data.currency,
    observations: data.observations || "",
    order_purchase: data.order_purchase || "",
    details:
      data.details?.map((detail) => ({
        product_id: detail.product_id.toString(),
        quantity: detail.quantity.toString(),
        unit_price: detail.unit_price.toString(),
      })) ?? [],
    installments:
      data.installments?.map((inst) => ({
        installment_number: inst.installment_number.toString(),
        due_days: inst.due_days.toString(),
        amount: inst.amount.toString(),
      })) ?? [],
  });

  const handleSubmit = async (data: Partial<SaleUpdateSchema>) => {
    if (!sale || !id) return;

    setIsSubmitting(true);
    try {
      await updateSale(Number(id), data);
      // El toast de éxito se muestra en el store
      navigate("/ventas");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          ERROR_MESSAGE(MODEL, "edit"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Venta" mode="edit" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  if (!sale) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent title="Venta" mode="edit" icon={ICON} />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Venta no encontrada</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Venta" mode="edit" icon={ICON} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Form */}
        {warehouses && warehouses.length > 0 && (
          <SaleForm
            defaultValues={mapSaleToForm(sale)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="edit"
            warehouses={warehouses}
            sale={sale}
            onCancel={() => navigate("/ventas")}
          />
        )}
      </div>
    </PageWrapper>
  );
};
