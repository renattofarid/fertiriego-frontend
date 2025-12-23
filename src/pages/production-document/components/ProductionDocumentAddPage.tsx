import { useNavigate } from "react-router-dom";
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
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProductionDocumentAddPage() {
  const { ROUTE, MODEL } = PRODUCTION_DOCUMENT;
  const navigate = useNavigate();
  const { createDocument, isSubmitting } = useProductionDocumentStore();

  // Hooks para datos
  const { data: warehouses = [], isLoading: loadingWarehouses } =
    useAllWarehouses();
  const { data: products = [], isLoading: loadingProducts } = useAllProducts();
  const users = useAllPersons();
  const responsibles = useAllPersons();

  const isLoading =
    loadingWarehouses || loadingProducts || !users || !responsibles;

  const onSubmit = async (values: ProductionDocumentFormValues) => {
    try {
      await createDocument(values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "create")
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
      products={products || []}
      users={users || []}
      responsibles={responsibles || []}
    />
  );
}
