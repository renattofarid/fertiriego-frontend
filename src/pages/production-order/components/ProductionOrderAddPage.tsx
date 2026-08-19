import { useNavigate } from "react-router-dom";
import { useCreateProductionOrder } from "../lib/production-order.hook";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import { ProductionOrderForm, type ProductionOrderFormValues } from "./ProductionOrderForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProductionOrderAddPage() {
  const { ROUTE } = PRODUCTION_ORDER;
  const navigate = useNavigate();
  const createOrder = useCreateProductionOrder();

  const { data: warehouses = [], isLoading: loadingWarehouses } = useAllWarehouses();

  const onSubmit = (values: ProductionOrderFormValues) => {
    createOrder.mutate(values as any, {
      onSuccess: () => navigate(ROUTE),
    });
  };

  if (loadingWarehouses) {
    return <PageSkeleton />;
  }

  return (
    <ProductionOrderForm
      mode="create"
      onSubmit={onSubmit}
      isSubmitting={createOrder.isPending}
      warehouses={warehouses || []}
    />
  );
}
