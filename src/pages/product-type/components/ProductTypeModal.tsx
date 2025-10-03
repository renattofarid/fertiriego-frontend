import { useState, useEffect } from "react";
import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { ProductTypeSchema } from "../lib/product-type.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import {
  PRODUCT_TYPE,
  type ProductTypeResource,
} from "../lib/product-type.interface";
import { useProductTypeLocalStorage } from "../lib/product-type-localStorage.hook";
import { ProductTypeForm } from "./ProductTypeForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = PRODUCT_TYPE;

export default function ProductTypeModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { create, update, getById, fetchAll } = useProductTypeLocalStorage();
  const [productType, setProductType] = useState<ProductTypeResource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "update" && id) {
      const found = getById(id);
      if (found) {
        setProductType(found);
      }
    } else {
      setProductType(EMPTY as ProductTypeResource);
    }
  }, [id, mode, getById]);

  const mapProductTypeToForm = (
    data: ProductTypeResource | { name: string; code: string }
  ): Partial<ProductTypeSchema> => ({
    name: data.name,
    code: data.code,
  });

  const handleSubmit = async (data: ProductTypeSchema) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await create(data);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else if (id) {
        await update(id, data);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }
      fetchAll();
      onClose();
    } catch (error: any) {
      errorToast(
        error.message ?? ERROR_MESSAGE(MODEL, mode === "create" ? "create" : "update")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingAny = isSubmitting || !productType;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-2xl"
    >
      {!isLoadingAny && productType ? (
        <ProductTypeForm
          defaultValues={mapProductTypeToForm(productType)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
