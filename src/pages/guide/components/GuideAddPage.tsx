"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GuideForm } from "./GuideForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useGuideMotives } from "../lib/guide.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { useGuideStore } from "../lib/guide.store";
import type { GuideSchema } from "../lib/guide.schema";
import { GUIDE } from "../lib/guide.interface";
import { useAllVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";
import { useWarehouseDocuments } from "@/pages/warehouse-document/lib/warehouse-document.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useOrder } from "@/pages/order/lib/order.hook";

export default function GuideAddPage() {
  const { ROUTE, MODEL, ICON } = GUIDE;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: motives, isLoading: motivesLoading } = useGuideMotives();
  const { data: vehicles, isLoading: vehiclesLoading } = useAllVehicles();
  const { data: carriers, isLoading: carriersLoading } = useAllSuppliers();
  const drivers = useAllWorkers();
  const { data: sales, isLoading: salesLoading } = useAllSales();
  const { data: purchases, isLoading: purchasesLoading } = useAllPurchases();
  const { data: warehouseDocuments, isLoading: warehouseDocumentsLoading } = useWarehouseDocuments();
  const recipients = useAllPersons();
  const { data: orders, isLoading: ordersLoading } = useOrder({ per_page: 1000 });

  const { createGuide } = useGuideStore();

  const isLoading =
    warehousesLoading ||
    productsLoading ||
    motivesLoading ||
    vehiclesLoading ||
    carriersLoading ||
    salesLoading ||
    purchasesLoading ||
    warehouseDocumentsLoading ||
    ordersLoading ||
    !warehouses ||
    !products ||
    !motives ||
    !vehicles ||
    !carriers ||
    !drivers ||
    !sales ||
    !purchases ||
    !warehouseDocuments ||
    !recipients;

  const getDefaultValues = (): Partial<GuideSchema> => ({
    warehouse_id: "",
    issue_date: "",
    transfer_date: "",
    motive_id: "",
    sale_id: "",
    purchase_id: "",
    warehouse_document_id: "",
    transport_modality: "PUBLICO",
    carrier_id: "",
    driver_id: "",
    vehicle_id: "",
    driver_license: "",
    origin_address: "",
    origin_ubigeo_id: "",
    destination_address: "",
    destination_ubigeo_id: "",
    destination_warehouse_id: "",
    recipient_id: "",
    observations: "",
    details: [],
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createGuide(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
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
          <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
        </div>
      </div>

      {warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 &&
        motives &&
        motives.length > 0 &&
        vehicles &&
        vehicles.length > 0 &&
        carriers &&
        carriers.length > 0 &&
        drivers &&
        drivers.length > 0 &&
        warehouseDocuments &&
        warehouseDocuments.length >= 0 &&
        recipients &&
        recipients.length >= 0 && (
          <GuideForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            onCancel={() => navigate(GUIDE.ROUTE)}
            isSubmitting={isSubmitting}
            mode="create"
            warehouses={warehouses}
            products={products}
            motives={motives}
            vehicles={vehicles}
            carriers={carriers}
            drivers={drivers}
            sales={sales}
            purchases={purchases}
            warehouseDocuments={warehouseDocuments}
            recipients={recipients}
            orders={orders || []}
          />
        )}
    </FormWrapper>
  );
}
