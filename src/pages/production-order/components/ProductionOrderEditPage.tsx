import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useProductionOrderStore } from "../lib/production-order.store";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import { ProductionOrderForm, type ProductionOrderFormValues } from "./ProductionOrderForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProductionOrderEditPage() {
  const { ROUTE, MODEL } = PRODUCTION_ORDER;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, fetchOrder, updateOrder, isSubmitting, isFinding } = useProductionOrderStore();

  const { data: warehouses = [], isLoading: loadingWarehouses } = useAllWarehouses();

  useEffect(() => {
    if (id) {
      fetchOrder(parseInt(id));
    }
  }, [id, fetchOrder]);

  const isLoading = loadingWarehouses || isFinding;

  const onSubmit = async (values: ProductionOrderFormValues) => {
    if (!id) return;
    try {
      await updateOrder(parseInt(id), values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "edit"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "edit"));
    }
  };

  if (isLoading || !order) {
    return <PageSkeleton />;
  }

  const initialValues: ProductionOrderFormValues = {
    warehouse_origin_id: order.warehouse_origin_id.toString(),
    warehouse_dest_id: order.warehouse_dest_id.toString(),
    product_id: order.product_id.toString(),
    responsible_id: order.responsible_id.toString(),
    requested_date: order.requested_date,
    quantity_requested: order.quantity_requested.toString(),
    currency: order.currency || "PEN",
    labor_cost: order.labor_cost.toString(),
    overhead_cost: order.overhead_cost.toString(),
    observations: order.observations || "",
    components: order.components.map((c) => ({
      component_id: c.component_id.toString(),
      component_name: c.component.name,
      quantity_required: c.quantity_required.toString(),
      unit_cost: c.unit_cost.toString(),
      waste_quantity: c.waste_quantity.toString(),
      waste_percentage: c.waste_percentage.toString(),
      notes: c.notes || "",
    })),
  };

  return (
    <ProductionOrderForm
      mode="edit"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      warehouses={warehouses || []}
    />
  );
}
