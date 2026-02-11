"use client";

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { SaleForm } from "./SaleForm";
import { type SaleSchema } from "../lib/sale.schema";
import { useSaleStore } from "../lib/sales.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { findQuotationById } from "@/pages/quotation/lib/quotation.actions";
import { findOrderById } from "@/pages/order/lib/order.actions";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { SALE } from "../lib/sale.interface";
import { useSidebar } from "@/components/ui/sidebar";
import PageWrapper from "@/components/PageWrapper";

export const SaleAddPage = () => {
  const { ICON, MODEL } = SALE;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceData, setSourceData] = useState<any>(null);
  const [sourceType, setSourceType] = useState<"quotation" | "order" | null>(
    null,
  );
  const [isFetchingSource, setIsFetchingSource] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();

  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();

  const { createSale } = useSaleStore();

  const isLoading = warehousesLoading || isFetchingSource;

  // Fetch quotation or order data from URL params
  useEffect(() => {
    const quotationId = searchParams.get("quotation_id");
    const orderId = searchParams.get("order_id");

    const fetchSourceData = async () => {
      setIsFetchingSource(true);
      try {
        if (quotationId) {
          const response = await findQuotationById(parseInt(quotationId));
          setSourceData(response.data);
          setSourceType("quotation");
        } else if (orderId) {
          const response = await findOrderById(parseInt(orderId));
          setSourceData(response.data);
          setSourceType("order");
        }
      } catch (error: any) {
        errorToast(
          error.response?.data?.message || "Error al cargar los datos",
        );
        navigate("/ventas");
      } finally {
        setIsFetchingSource(false);
      }
    };

    if (quotationId || orderId) {
      fetchSourceData();
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const getDefaultValues = (): Partial<SaleSchema> => ({
    customer_id: "",
    warehouse_id: "",
    document_type: "",
    issue_date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    payment_type: "CONTADO",
    currency: "PEN",
    observations: "",
    order_purchase: "",
    details: [],
    installments: [],
  });

  const handleSubmit = async (data: SaleSchema) => {
    setIsSubmitting(true);
    try {
      // Add quotation_id or order_id based on source
      const saleData = {
        ...data,
        quotation_id:
          sourceType === "quotation" && sourceData ? sourceData.id : undefined,
        order_id:
          sourceType === "order" && sourceData ? sourceData.id : undefined,
      };

      await createSale(saleData);
      successToast("Venta creada correctamente");
      navigate("/ventas");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          ERROR_MESSAGE(MODEL, "create"),
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
            <TitleFormComponent title="Venta" mode="create" icon={ICON} />
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
          <TitleFormComponent title="Venta" mode="create" icon={ICON} />
        </div>
      </div>

      {warehouses && warehouses.length > 0 && (
        <SaleForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          warehouses={warehouses}
          sourceData={sourceData}
          sourceType={sourceType}
          onCancel={() => navigate("/ventas")}
        />
      )}
    </PageWrapper>
  );
};
