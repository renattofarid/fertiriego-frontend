import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useProductionDocumentStore } from "../lib/production-document.store";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { PRODUCTION_DOCUMENT } from "../lib/production-document.interface";
import {
  ProductionDocumentForm,
  type ProductionDocumentFormValues,
} from "./ProductionDocumentForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProductionDocumentEditPage() {
  const { ROUTE, MODEL } = PRODUCTION_DOCUMENT;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { document, fetchDocument, updateDocument, isSubmitting, isFinding } =
    useProductionDocumentStore();

  // Hooks para datos
  const { data: warehouses = [], isLoading: loadingWarehouses } =
    useAllWarehouses();

  // Cargar documento al montar
  useEffect(() => {
    if (id) {
      fetchDocument(parseInt(id));
    }
  }, [id, fetchDocument]);

  const isLoading = loadingWarehouses || isFinding;

  const onSubmit = async (values: ProductionDocumentFormValues) => {
    if (!id) return;
    try {
      await updateDocument(parseInt(id), values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "edit"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "edit"));
    }
  };

  if (isLoading || !document) {
    return <PageSkeleton />;
  }

  // Mapear datos del documento a initialValues
  const initialValues: ProductionDocumentFormValues = {
    warehouse_origin_id: document.warehouse_origin_id.toString(),
    warehouse_dest_id: document.warehouse_dest_id.toString(),
    product_id: document.product_id.toString(),
    user_id: document.user_id.toString(),
    responsible_id: document.responsible_id.toString(),
    production_date: document.production_date,
    quantity_produced: document.quantity_produced.toString(),
    labor_cost: document.labor_cost.toString(),
    overhead_cost: document.overhead_cost.toString(),
    observations: document.observations || "",
    components: document.details.map((d) => ({
      component_id: d.component_id.toString(),
      component_name: d.component_name,
      quantity_required: d.quantity_required.toString(),
      quantity_used: d.quantity_used.toString(),
      unit_cost: d.unit_cost.toString(),
      notes: d.notes,
    })),
  };

  return (
    <ProductionDocumentForm
      mode="edit"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      warehouses={warehouses || []}
    />
  );
}
