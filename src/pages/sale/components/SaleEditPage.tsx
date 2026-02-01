"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { SaleForm } from "./SaleForm";
import { type SaleUpdateSchema } from "../lib/sale.schema";
import { useSaleStore } from "../lib/sales.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { SALE, type SaleResource } from "../lib/sale.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast } from "@/lib/core.function";
import { format, parse } from "date-fns";

export const SaleEditPage = () => {
  const { ICON } = SALE;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();

  const { updateSale, fetchSale, sale, isFinding } = useSaleStore();

  const isLoading = warehousesLoading || isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/ventas");
      return;
    }
    fetchSale(Number(id));
  }, [id, navigate, fetchSale]);

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
        error.response?.data?.message || "Error al actualizar la venta",
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
            <TitleFormComponent title="Venta" mode="update" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!sale) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent title="Venta" mode="update" icon={ICON} />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Venta no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Venta" mode="update" icon={ICON} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Form */}
        {warehouses && warehouses.length > 0 && (
          <SaleForm
            defaultValues={mapSaleToForm(sale)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="update"
            warehouses={warehouses}
            sale={sale}
            onCancel={() => navigate("/ventas")}
          />
        )}
      </div>
    </FormWrapper>
  );
};
