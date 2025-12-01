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
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
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

  const { data: categories, isLoading: loadingCategories } = useAllCategories();
  const { data: brands, isLoading: loadingBrands } = useAllBrands();
  const { data: units, isLoading: loadingUnits } = useAllUnits();
  const { data: productTypes, isLoading: loadingProductTypes } =
    useAllProductTypes();

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
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateProduct(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchProduct();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "update")
          );
        });
    }
  };

  const isLoadingAny =
    isSubmitting ||
    findingProduct ||
    loadingCategories ||
    loadingBrands ||
    loadingUnits ||
    loadingProductTypes;

  return (
    <GeneralModal
      open={open}
      onClose={onCloseModal}
      title={title}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {!isLoadingAny && categories && brands && units && productTypes ? (
        <ProductForm
          defaultValues={mapProductToForm(product)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onCloseModal}
          categories={categories}
          brands={brands}
          units={units}
          productTypes={productTypes}
          product={mode === "update" && product ? product : undefined}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
