import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { ProductSchema } from "../lib/product.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT, type ProductResource } from "../lib/product.interface";
import { useProduct, useProductById } from "../lib/product.hook";
import { useProductStore } from "../lib/product.store";
import { ProductForm } from "./ProductForm";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
  onCloseModal: () => void;
}

const { MODEL, EMPTY } = PRODUCT;

export default function ProductModal({
  id,
  open,
  title,
  mode,
  onClose,
  onCloseModal,
}: Props) {
  const { refetch } = useProduct();

  const {
    data: product,
    isFinding: findingProduct,
    refetch: refetchProduct,
  } = mode === "create"
    ? {
        data: null,
        isFinding: false,
        refetch: refetch,
      }
    : useProductById(id!);

  const { data: units, isLoading: loadingUnits } = useAllUnits();

  const mapProductToForm = (
    data: ProductResource | null
  ): Partial<ProductSchema> => {
    if (!data) {
      return EMPTY;
    }
    return {
      name: data.name || "",
      category_id: data.category_id.toString() || "",
      brand_id: data.brand_id.toString() || "",
      unit_id: data.unit_id.toString() || "",
      product_type_id: data.product_type_id.toString() || "",
      technical_sheet: [],
    };
  };

  const { isSubmitting, updateProduct, createProduct } = useProductStore();

  const handleSubmit = async (data: ProductSchema) => {
    if (mode === "create") {
      await createProduct(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateProduct(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          refetchProduct();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "edit")
          );
        });
    }
  };

  const isLoadingAny =
    isSubmitting ||
    findingProduct ||
    loadingUnits;

  return (
    <GeneralModal
      open={open}
      onClose={onCloseModal}
      title={title}
      maxWidth="!max-w-[--breakpoint-md]"
    >
      {!isLoadingAny && units ? (
        <ProductForm
          defaultValues={mapProductToForm(product)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onCloseModal}
          units={units}
          product={mode === "edit" && product ? product : undefined}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
