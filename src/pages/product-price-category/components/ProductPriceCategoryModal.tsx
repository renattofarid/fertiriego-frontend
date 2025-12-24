import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { ProductPriceCategorySchema } from "../lib/product-price-category.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT_PRICE_CATEGORY, type ProductPriceCategoryResource } from "../lib/product-price-category.interface";
import { useProductPriceCategory, useProductPriceCategoryById } from "../lib/product-price-category.hook";
import { useProductPriceCategoryStore } from "../lib/product-price-category.store";
import { ProductPriceCategoryForm } from "./ProductPriceCategoryForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = PRODUCT_PRICE_CATEGORY;

export default function ProductPriceCategoryModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useProductPriceCategory();

  const {
    data: productPriceCategory,
    isFinding: findingProductPriceCategory,
    refetch: refetchProductPriceCategory,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useProductPriceCategoryById(id!);

  const mapProductPriceCategoryToForm = (data: ProductPriceCategoryResource): Partial<ProductPriceCategorySchema> => ({
    name: data?.name || "",
  });

  const { isSubmitting, updateProductPriceCategory, createProductPriceCategory } = useProductPriceCategoryStore();

  const handleSubmit = async (data: ProductPriceCategorySchema) => {
    if (mode === "create") {
      await createProductPriceCategory(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            (error.response.data.message ?? error.response.data.error) ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateProductPriceCategory(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchProductPriceCategory();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            (error.response.data.message ?? error.response.data.error) ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "update")
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingProductPriceCategory;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && productPriceCategory ? (
        <ProductPriceCategoryForm
          defaultValues={mapProductPriceCategoryToForm(productPriceCategory)}
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
