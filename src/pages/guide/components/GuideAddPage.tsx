"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GuideForm } from "./GuideForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useGuideMotives } from "../lib/guide.hook";
import FormSkeleton from "@/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { useGuideStore } from "../lib/guide.store";
import type { GuideSchema } from "../lib/guide.schema";
import { GUIDE, type GuideResource } from "../lib/guide.interface";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useWarehouseDocuments } from "@/pages/warehouse-document/lib/warehouse-document.hook";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

const mapGuideToDefaultValues = (guide: GuideResource): Partial<GuideSchema> => {
  const today = new Date().toISOString().split("T")[0];
  return {
    warehouse_id: guide.warehouse?.id?.toString() || "",
    issue_date: today,
    transfer_date: today,
    motive_id: guide.motive?.id?.toString() || "1",
    sale_id: guide.sale?.id ? guide.sale.id.toString() : undefined,
    purchase_id: guide.purchase?.id ? guide.purchase.id.toString() : undefined,
    warehouse_document_id: guide.warehouse_document?.id
      ? guide.warehouse_document.id.toString()
      : undefined,
    order_id: (guide as any).order?.id
      ? (guide as any).order.id.toString()
      : undefined,
    transport_modality: guide.transport_modality || "PUBLICO",
    carrier_id: guide.carrier?.id?.toString() || "",
    driver_id: guide.driver?.id?.toString() || "",
    vehicle_id: guide.vehicle?.id?.toString() || "",
    secondary_vehicle_id:
      (guide as any).secondary_vehicle?.id?.toString() || undefined,
    driver_license: guide.driver_license || "-",
    vehicle_plate: guide.vehicle_plate || "",
    vehicle_brand: guide.vehicle_brand || "-",
    vehicle_model: guide.vehicle_model || "-",
    vehicle_mtc: guide.vehicle_mtc || "-",
    remittent_id: (guide as any).remittent?.id?.toString() || "1860",
    shipping_guide_remittent_id:
      (guide as any).shipping_guide_remittent?.id?.toString() || undefined,
    origin_address: guide.origin_address || "",
    origin_ubigeo_id: guide.originUbigeo?.id.toString() || "1243",
    destination_address: guide.destination_address || "",
    destination_ubigeo_id: guide.destinationUbigeo?.id.toString() || "",
    destination_warehouse_id: guide.destination_warehouse?.id
      ? guide.destination_warehouse.id.toString()
      : undefined,
    recipient_id: guide.recipient?.id ? guide.recipient.id.toString() : undefined,
    observations: guide.observations || "",
    details: guide.details?.map((detail) => ({
      product_id: detail.product_id.toString(),
      description: detail.description,
      quantity: Number(detail.quantity),
      unit_measure: detail.unit_measure || "UND",
      weight: Number(detail.weight) || 0,
    })),
    total_packages: guide.total_packages || 0,
  };
};

export default function GuideAddPage() {
  const { ROUTE, MODEL, ICON } = GUIDE;
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateFrom = (location.state as { duplicateFrom?: GuideResource } | null)?.duplicateFrom;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: motives, isLoading: motivesLoading } = useGuideMotives();
  const { data: sales, isLoading: salesLoading } = useAllSales();
  const { data: warehouseDocuments, isLoading: warehouseDocumentsLoading } =
    useWarehouseDocuments();

  const { createGuide } = useGuideStore();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const isLoading =
    warehousesLoading ||
    motivesLoading ||
    salesLoading ||
    warehouseDocumentsLoading ||
    !warehouses ||
    !motives ||
    !sales ||
    !warehouseDocuments;

  const getDefaultValues = (): Partial<GuideSchema> => ({
    warehouse_id: "",
    issue_date: "",
    transfer_date: "",
    motive_id: "1",
    sale_id: "",
    purchase_id: "",
    warehouse_document_id: "",
    order_id: "",
    transport_modality: "PUBLICO",
    carrier_id: "",
    driver_id: "",
    vehicle_id: "",
    secondary_vehicle_id: "",
    driver_license: "-",
    vehicle_plate: "",
    vehicle_brand: "-",
    vehicle_model: "-",
    vehicle_mtc: "-",
    remittent_id: "1860",
    shipping_guide_remittent_id: "",
    origin_address: "CAL. CALLE 01 NRO. 191 P.J. AMPLIACION 9 DE OCTUBRE (CERCA ANTENA RADIO PROGRAMAS), LAMBAYEQUE - CHICLAYO - CHICLAYO",
    origin_ubigeo_id: "1243",
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
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "create"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <TitleFormComponent
          title={MODEL.name}
          mode="create"
          icon={ICON}
          backRoute={ROUTE}
        />
        <FormSkeleton />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TitleFormComponent
        title={MODEL.name}
        mode="create"
        icon={ICON}
        backRoute={ROUTE}
      />

      {warehouses && warehouses.length > 0 && motives && motives.length > 0 && (
        <GuideForm
          defaultValues={duplicateFrom ? mapGuideToDefaultValues(duplicateFrom) : getDefaultValues()}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTE)}
          isSubmitting={isSubmitting}
          mode="create"
          warehouses={warehouses}
          motives={motives}
        />
      )}
    </PageWrapper>
  );
}
