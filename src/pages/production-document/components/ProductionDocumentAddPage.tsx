import { useNavigate, useLocation } from "react-router-dom";
import { useProductionDocumentStore } from "../lib/production-document.store";
import {
  ERROR_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { PRODUCTION_DOCUMENT } from "../lib/production-document.interface";
import type { CreateProductionDocumentBatchRequest } from "../lib/production-document.interface";
import { ProductionDocumentBatchForm } from "./ProductionDocumentBatchForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProductionDocumentAddPage() {
  const { ROUTE, MODEL } = PRODUCTION_DOCUMENT;
  const navigate = useNavigate();
  const location = useLocation();
  const { createDocumentBatch, isSubmitting } = useProductionDocumentStore();

  const fromOrderId: number | undefined = location.state?.fromOrderId;

  const { data: warehouses = [], isLoading: loadingWarehouses } =
    useAllWarehouses();

  // ✅ Toda orden agrupa uno o varios productos (items[]); generar un
  // documento "desde una orden" significa elegir cuáles de esos productos se
  // producen ahora. El backend expone /productiondocument/batch para crear,
  // en una sola request, un documento independiente por cada ítem elegido.
  const onSubmit = async (payload: CreateProductionDocumentBatchRequest) => {
    try {
      const created = await createDocumentBatch(payload);
      successToast(
        created.length > 1
          ? `${created.length} documentos de producción generados correctamente`
          : "Documento de producción generado correctamente",
      );
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "create"),
      );
    }
  };

  if (loadingWarehouses) {
    return <PageSkeleton />;
  }

  return (
    <ProductionDocumentBatchForm
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      warehouses={warehouses || []}
      fromOrderId={fromOrderId}
    />
  );
}
