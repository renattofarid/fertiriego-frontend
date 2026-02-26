"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { GUIDE } from "../lib/guide.interface";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useWarehouseDocuments } from "@/pages/warehouse-document/lib/warehouse-document.hook";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export default function GuideAddPage() {
  const { ROUTE, MODEL, ICON } = GUIDE;
  const navigate = useNavigate();
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
          defaultValues={getDefaultValues()}
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
