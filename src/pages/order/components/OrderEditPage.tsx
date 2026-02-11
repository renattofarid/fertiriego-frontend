"use client";

import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { OrderForm } from "./OrderForm";
import { useOrderStore } from "../lib/order.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllQuotations } from "@/pages/quotation/lib/quotation.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import {
  ORDER,
  type OrderResource,
  type UpdateOrderRequest,
} from "../lib/order.interface";
import FormSkeleton from "@/components/FormSkeleton";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export const OrderEditPage = () => {
  const { MODEL, ICON } = ORDER;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  const { setOpen, setOpenMobile } = useSidebar();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: quotations, isLoading: quotationsLoading } = useAllQuotations();

  const { updateOrder, fetchOrder, order, isFinding, isSubmitting } =
    useOrderStore();

  const isLoading = warehousesLoading || quotationsLoading || isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/pedidos");
      return;
    }

    fetchOrder(Number(id));
  }, [id, navigate, fetchOrder]);

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const mapOrderToForm = (data: OrderResource): any => ({
    customer_id: data.customer_id?.toString(),
    warehouse_id: data.warehouse.id.toString(),
    order_date: data.order_date,
    order_delivery_date: data.order_delivery_date,
    order_expiry_date: data.order_expiry_date,
    currency: data.currency,
    address: data.address || "",
    observations: data.observations || "",
    quotation_id: data.quotation_id?.toString() || "",
  });

  const handleSubmit = async (data: UpdateOrderRequest) => {
    if (!order || !id) return;

    // Doble protección: ref inmediato + estado del store
    if (isSubmittingRef.current || isSubmitting) return;

    isSubmittingRef.current = true;

    try {
      await updateOrder(Number(id), data);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      // Navegar después de un breve delay para que el usuario vea el toast
      setTimeout(() => {
        navigate("/pedidos");
      }, 500);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "update"),
      );
      // Solo resetear el ref en caso de error (en éxito, navega)
      isSubmittingRef.current = false;
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Pedido no encontrado</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
      </div>

      <div className="space-y-6">
        {warehouses && warehouses.length > 0 && (
          <OrderForm
            defaultValues={mapOrderToForm(order)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="update"
            warehouses={warehouses}
            quotations={quotations}
            order={order}
            onCancel={() => navigate("/pedidos")}
          />
        )}
      </div>
    </PageWrapper>
  );
};
