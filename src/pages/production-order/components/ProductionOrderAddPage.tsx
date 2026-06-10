import { useNavigate } from "react-router-dom";
import { useProductionOrderStore } from "../lib/production-order.store";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import { ProductionOrderForm, type ProductionOrderFormValues } from "./ProductionOrderForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProductionOrderAddPage() {
  const { ROUTE, MODEL } = PRODUCTION_ORDER;
  const navigate = useNavigate();
  const { createOrder, isSubmitting } = useProductionOrderStore();

  const { data: warehouses = [], isLoading: loadingWarehouses } = useAllWarehouses();

  const onSubmit = async (values: ProductionOrderFormValues) => {
    try {
      await createOrder(values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "create"));
    }
  };

  if (loadingWarehouses) {
    return <PageSkeleton />;
  }

  return (
    <ProductionOrderForm
      mode="create"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      warehouses={warehouses || []}
    />
  );
}
