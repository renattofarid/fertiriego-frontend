"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { OrderForm } from "./OrderForm";
import { useOrderStore } from "../lib/order.store";
import { useClients } from "@/pages/client/lib/client.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllQuotations } from "@/pages/quotation/lib/quotation.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast, successToast } from "@/lib/core.function";
import { ORDER, type CreateOrderRequest } from "../lib/order.interface";

export const OrderAddPage = () => {
  const { ICON } = ORDER;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers, isLoading: customersLoading } = useClients();
  const { data: warehouses, isLoading: warehousesLoading } =
    useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: quotations, isLoading: quotationsLoading } =
    useAllQuotations();

  const { createOrder } = useOrderStore();

  const isLoading =
    customersLoading ||
    warehousesLoading ||
    productsLoading ||
    quotationsLoading;

  const handleSubmit = async (data: CreateOrderRequest) => {
    setIsSubmitting(true);
    try {
      await createOrder(data);
      successToast("Pedido creado correctamente");
      navigate("/pedidos");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al crear el pedido"
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
            <TitleFormComponent title="Pedido" mode="create" icon={ICON} />
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
          <TitleFormComponent title="Pedido" mode="create" icon={ICON} />
        </div>
      </div>

      {customers &&
        customers.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 && (
          <OrderForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/pedidos")}
            isSubmitting={isSubmitting}
            customers={customers}
            warehouses={warehouses}
            products={products}
            quotations={quotations}
          />
        )}
    </FormWrapper>
  );
};
