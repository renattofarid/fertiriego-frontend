import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WarehouseDocumentForm from "./WarehouseDocumentForm";
import TitleComponent from "@/components/TitleComponent";
import { BackButton } from "@/components/BackButton";
import PageWrapper from "@/components/PageWrapper";
import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { useWarehouseDocumentById } from "../lib/warehouse-document.hook";
import { useWarehouseDocumentStore } from "../lib/warehouse-document.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { successToast, errorToast } from "@/lib/core.function";
import PageSkeleton from "@/components/PageSkeleton";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";

const { ICON, TITLES } = WAREHOUSE_DOCUMENT;

export default function WarehouseDocumentEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useAllWarehouses();
  const persons = useAllWorkers();
  const { data: products } = useAllProducts();

  const { data: document, isFinding } = useWarehouseDocumentById(parseInt(id!));
  const { updateDocument } = useWarehouseDocumentStore();

  const handleSubmit = async (data: WarehouseDocumentSchema) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const payload = {
        warehouse_id: parseInt(data.warehouse_id),
        document_type: data.document_type as any,
        document_number: data.document_number,
        person_id: parseInt(data.person_id),
        document_date: data.document_date,
        observations: data.observations,
        details: data.details.map((detail) => ({
          id: detail.id,
          product_id: parseInt(detail.product_id),
          quantity: detail.quantity,
          unit_cost: detail.unit_cost,
          observations: detail.observations,
        })),
      };

      await updateDocument(parseInt(id), payload);
      successToast("Documento actualizado exitosamente");
      navigate("/documentos-almacen");
    } catch (error: any) {
      const errorMessage =
           (error.response.data.message ?? error.response.data.error) ??
           "Error al actualizar el documento";
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinding) {
    return <PageSkeleton />;
  }

  if (!document) {
    return (
      <PageWrapper>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Documento no encontrado</p>
        </div>
      </PageWrapper>
    );
  }

  const defaultValues: Partial<WarehouseDocumentSchema> = {
    warehouse_id: document.warehouse_id.toString(),
    document_type: document.document_type,
    document_number: document.document_number,
    person_id: document.person_id.toString(),
    document_date: document.document_date,
    observations: document.observations || "",
    details: document.details.map((detail) => ({
      id: detail.id,
      product_id: detail.product_id.toString(),
      quantity: detail.quantity,
      unit_cost: detail.unit_cost,
      observations: detail.observations || "",
    })),
  };

  return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <TitleComponent
            title={TITLES.update.title}
            subtitle={TITLES.update.subtitle}
            icon={ICON}
          />
        </div>

        {warehouses && persons && products && (
          <WarehouseDocumentForm
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            isSubmitting={isSubmitting}
            mode="update"
            warehouses={warehouses}
            persons={persons}
            products={products}
          />
        )}
      </div>
    </PageWrapper>
  );
}
