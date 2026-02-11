"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GuideForm } from "./GuideForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useGuideMotives } from "../lib/guide.hook";
import { useAllVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";
import { useWarehouseDocuments } from "@/pages/warehouse-document/lib/warehouse-document.hook";
import { useOrder } from "@/pages/order/lib/order.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { useGuideStore } from "../lib/guide.store";
import { GUIDE, type GuideResource } from "../lib/guide.interface";
import type { GuideSchema } from "../lib/guide.schema";

export default function GuideEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { MODEL, ROUTE, ICON } = GUIDE;
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: motives, isLoading: motivesLoading } = useGuideMotives();
  const { data: vehicles, isLoading: vehiclesLoading } = useAllVehicles();
  const carriers = useAllPersons({
    role_names: ["TRANSPORTISTA"],
  });
  const { data: sales, isLoading: salesLoading } = useAllSales();
  const { data: purchases, isLoading: purchasesLoading } = useAllPurchases();
  const { data: warehouseDocuments, isLoading: warehouseDocumentsLoading } =
    useWarehouseDocuments();
  const recipients = useAllPersons();
  const remittents = useAllPersons(); // Usar misma lista de personas para remitentes
  const { data: orders, isLoading: ordersLoading } = useOrder({
    per_page: 1000,
  });

  const { updateGuide, fetchGuide, guide, isFinding } = useGuideStore();

  const isLoading =
    warehousesLoading ||
    motivesLoading ||
    vehiclesLoading ||
    salesLoading ||
    purchasesLoading ||
    warehouseDocumentsLoading ||
    ordersLoading ||
    !warehouses ||
    !motives ||
    !vehicles ||
    !carriers ||
    !drivers ||
    !sales ||
    !purchases ||
    !warehouseDocuments ||
    !recipients ||
    isFinding;

  useEffect(() => {
    if (!id) {
      navigate(ROUTE);
      return;
    }
    fetchGuide(Number(id));
  }, [id, navigate, fetchGuide]);

  const mapGuideToForm = (data: GuideResource): Partial<GuideSchema> => {
    return {
      warehouse_id: data.warehouse?.id?.toString() || "",
      issue_date: data.issue_date?.split("T")[0],
      transfer_date: data.transfer_date?.split("T")[0],
      motive_id: data.motive?.id?.toString() || "",
      sale_id: data.sale?.id ? data.sale.id.toString() : undefined,
      purchase_id: data.purchase?.id ? data.purchase.id.toString() : undefined,
      warehouse_document_id: data.warehouse_document?.id
        ? data.warehouse_document.id.toString()
        : undefined,
      order_id: (data as any).order?.id
        ? (data as any).order.id.toString()
        : undefined,
      transport_modality: data.transport_modality,
      carrier_id: data.carrier?.id?.toString() || "",
      driver_id: data.driver?.id?.toString() || "",
      vehicle_id: data.vehicle?.id?.toString() || "",
      secondary_vehicle_id:
        (data as any).secondary_vehicle?.id?.toString() || undefined,
      driver_license: data.driver_license,
      vehicle_plate: (data as any).vehicle_plate,
      vehicle_brand: (data as any).vehicle_brand,
      vehicle_model: (data as any).vehicle_model,
      vehicle_mtc: (data as any).vehicle_mtc,
      remittent_id: (data as any).remittent?.id?.toString() || "",
      shipping_guide_remittent_id:
        (data as any).shipping_guide_remittent?.id?.toString() || undefined,
      origin_address: data.origin_address,
      origin_ubigeo_id: data.originUbigeo.id.toString(),
      destination_address: data.destination_address,
      destination_ubigeo_id: data.destinationUbigeo.id.toString(),
      destination_warehouse_id: data.destination_warehouse?.id
        ? data.destination_warehouse.id.toString()
        : undefined,
      recipient_id: data.recipient?.id
        ? data.recipient.id.toString()
        : undefined,
      observations: data.observations,
      details: data.details.map((detail) => ({
        product_id: detail.product_id.toString(),
        description: detail.description,
        quantity: Number(detail.quantity),
        unit_measure: detail.unit_measure || "UND",
        weight: Number(detail.weight) || 0,
      })),
    };
  };

  const handleSubmit = async (data: any) => {
    if (!guide || !id) return;

    setIsSubmitting(true);
    try {
      await updateGuide(Number(id), data);
      successToast("Guía de remisión actualizada correctamente");
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
            <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
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
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
      </div>

      {warehouses &&
        warehouses.length > 0 &&
        motives &&
        motives.length > 0 &&
        vehicles &&
        vehicles.length > 0 &&
        carriers &&
        carriers.length > 0 &&
        drivers &&
        drivers.length > 0 &&
        sales &&
        sales.length >= 0 &&
        purchases &&
        purchases.length >= 0 &&
        warehouseDocuments &&
        warehouseDocuments.length >= 0 &&
        recipients &&
        recipients.length >= 0 &&
        guide && (
          <GuideForm
            defaultValues={mapGuideToForm(guide)}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTE)}
            isSubmitting={isSubmitting}
            mode="update"
            warehouses={warehouses}
            motives={motives}
            vehicles={vehicles}
            carriers={carriers}
            drivers={drivers}
            sales={sales}
            purchases={purchases}
            warehouseDocuments={warehouseDocuments}
            recipients={recipients}
            remittents={remittents || []}
            orders={orders || []}
          />
        )}
    </FormWrapper>
  );
}
