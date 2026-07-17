import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { findProductionOrderById } from "@/pages/production-order/lib/production-order.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

export default function ProductionDocumentAddPage() {
  const { ROUTE, MODEL } = PRODUCTION_DOCUMENT;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { createDocument, isSubmitting } = useProductionDocumentStore();

  const fromOrderId: number | undefined = location.state?.fromOrderId;

  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderInitialValues, setOrderInitialValues] =
    useState<ProductionDocumentFormValues | null>(null);

  const { data: warehouses = [], isLoading: loadingWarehouses } =
    useAllWarehouses();

  useEffect(() => {
    if (!fromOrderId) return;
    setLoadingOrder(true);
    findProductionOrderById(fromOrderId)
      .then((response) => {
        const order = response.data.data;
        setOrderInitialValues({
          warehouse_origin_id: order.warehouse_origin_id.toString(),
          warehouse_dest_id: order.warehouse_dest_id.toString(),
          product_id: order.product_id.toString(),
          user_id: user?.id.toString() || "",
          responsible_id: order.responsible_id.toString(),
          production_order_id: order.id.toString(),
          production_date: "",
          quantity_produced: order.quantity_requested.toString(),
          labor_cost: order.labor_cost.toString(),
          overhead_cost: "0",
          observations: order.observations || "",
          components: order.components.map((c) => ({
            component_id: c.component_id.toString(),
            component_name: c.component.name,
            quantity_required: c.quantity_required.toString(),
            quantity_used: c.quantity_required.toString(),
            unit_cost: c.unit_cost.toString(),
            notes: c.notes || "",
          })),
        });
      })
      .catch(() => {
        errorToast("Error al cargar los datos de la orden de producción");
      })
      .finally(() => {
        setLoadingOrder(false);
      });
  }, [fromOrderId, user?.id]);

  const isLoading = loadingWarehouses || loadingOrder;

  const onSubmit = async (values: ProductionDocumentFormValues) => {
    try {
      await createDocument(values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "create"),
      );
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <ProductionDocumentForm
      mode="create"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      warehouses={warehouses || []}
      initialValues={orderInitialValues ?? undefined}
    />
  );
}
