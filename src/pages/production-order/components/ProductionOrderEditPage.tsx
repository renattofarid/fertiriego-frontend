import { useNavigate, useParams } from "react-router-dom";
import { useProductionOrderById, useUpdateProductionOrder } from "../lib/production-order.hook";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import { ProductionOrderForm, type ProductionOrderFormValues } from "./ProductionOrderForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProductionOrderEditPage() {
  const { ROUTE } = PRODUCTION_ORDER;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numId = Number(id);

  const { data: order, isLoading: isFinding } = useProductionOrderById(numId);
  const updateOrder = useUpdateProductionOrder();

  const { data: warehouses = [], isLoading: loadingWarehouses } = useAllWarehouses();

  const isLoading = loadingWarehouses || isFinding;

  const onSubmit = (values: ProductionOrderFormValues) => {
    if (!id) return;
    updateOrder.mutate(
      { id: numId, data: values as any },
      { onSuccess: () => navigate(ROUTE) },
    );
  };

  if (isLoading || !order) {
    return <PageSkeleton />;
  }

  // ✅ El GET /production-orders/{id} ya expone "items[]": se reconstruyen
  // todos los productos de la orden (antes solo se podía editar el primero).
  const initialValues: ProductionOrderFormValues = {
    warehouse_origin_id: order.warehouse_origin_id.toString(),
    warehouse_dest_id: order.warehouse_dest_id.toString(),
    responsible_id: order.responsible_id.toString(),
    requested_date: order.requested_date,
    currency: order.currency || "PEN",
    observations: order.observations || "",
    items: order.items.map((item) => ({
      product_id: item.product_id.toString(),
      product_name: item.product?.name ?? "",
      quantity_requested: item.quantity_requested.toString(),
      labor_cost: item.labor_cost.toString(),
      // overhead_cost no se edita: lo calcula el backend automáticamente.
      notes: item.notes || "",
      use_combo: (item.components?.length ?? 0) === 0,
      components: (item.components ?? []).map((c) => ({
        component_id: c.component_id.toString(),
        component_name: c.component.name,
        quantity_required: c.quantity_required.toString(),
        unit_cost: c.unit_cost.toString(),
        // waste_quantity/waste_percentage no se editan: los calcula el
        // backend automáticamente, solo se muestran en el detalle.
        notes: c.notes || "",
      })),
    })),
  };

  return (
    <ProductionOrderForm
      mode="edit"
      onSubmit={onSubmit}
      isSubmitting={updateOrder.isPending}
      initialValues={initialValues}
      warehouses={warehouses || []}
    />
  );
}
