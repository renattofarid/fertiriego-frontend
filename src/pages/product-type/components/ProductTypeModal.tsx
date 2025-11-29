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
import { useProductType, useProductTypeById } from "../lib/product-type.hook";
import { useProductTypeStore } from "../lib/product-type.store";
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
  const { refetch } = useProductType();

  const {
    data: productType,
    isFinding: findingProductType,
    refetch: refetchProductType,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useProductTypeById(id!);

  const mapProductTypeToForm = (
    data: ProductTypeResource | { name: string; code: string }
  ): Partial<ProductTypeSchema> => ({
    name: data.name,
    code: data.code,
  });

  const { isSubmitting, updateProductType, createProductType } =
    useProductTypeStore();

  const handleSubmit = async (data: ProductTypeSchema) => {
    if (mode === "create") {
      await createProductType(data)
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
      await updateProductType(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchProductType();
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

  const isLoadingAny = isSubmitting || findingProductType;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-2xl"
    >
      {!isLoadingAny && productType ? (
        <ProductTypeForm
          defaultValues={
            mode === "create"
              ? (productType as ProductTypeResource)
              : mapProductTypeToForm(productType)
          }
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
