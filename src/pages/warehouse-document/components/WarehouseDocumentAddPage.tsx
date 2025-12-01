import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WarehouseDocumentForm from "./WarehouseDocumentForm";
import TitleComponent from "@/components/TitleComponent";
import { BackButton } from "@/components/BackButton";
import PageWrapper from "@/components/PageWrapper";
import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { storeWarehouseDocument } from "../lib/warehouse-document.actions";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { successToast, errorToast } from "@/lib/core.function";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";

const { ICON, EMPTY, TITLES } = WAREHOUSE_DOCUMENT;

export default function WarehouseDocumentAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useAllWarehouses();
  const persons = useAllWorkers();
  const { data: products } = useAllProducts();

  const handleSubmit = async (data: WarehouseDocumentSchema) => {
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
          product_id: parseInt(detail.product_id),
          quantity: detail.quantity,
          unit_cost: detail.unit_cost,
          observations: detail.observations,
        })),
      };

      await storeWarehouseDocument(payload);
      successToast("Documento creado exitosamente");
      navigate("/documentos-almacen");
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? (error.response.data.message ?? error.response.data.error) : "Error al crear el documento";
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <TitleComponent
            title={TITLES.create.title}
            subtitle={TITLES.create.subtitle}
            icon={ICON}
          />
        </div>

        {warehouses && persons && products && (
          <WarehouseDocumentForm
            onSubmit={handleSubmit}
            defaultValues={EMPTY}
            isSubmitting={isSubmitting}
            mode="create"
            warehouses={warehouses}
            persons={persons}
            products={products}
          />
        )}
      </div>
    </PageWrapper>
  );
}
