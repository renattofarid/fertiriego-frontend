import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { WarehouseProductSchema } from "../lib/warehouse-product.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import {
  WAREHOUSE_PRODUCT,
  type WarehouseProductResource,
} from "../lib/warehouse-product.interface";
import {
  useWarehouseProduct,
  useWarehouseProductById,
} from "../lib/warehouse-product.hook";
import { useWarehouseProductStore } from "../lib/warehouse-product.store";
import { WarehouseProductForm } from "./WarehouseProductForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
  preselectedProductId?: number;
}

const { MODEL, EMPTY } = WAREHOUSE_PRODUCT;

export default function WarehouseProductModal({
  id,
  open,
  title,
  mode,
  onClose,
  preselectedProductId,
}: Props) {
  const { refetch } = useWarehouseProduct();

  const {
    data: warehouseProduct,
    isFinding: findingWarehouseProduct,
    refetch: refetchWarehouseProduct,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useWarehouseProductById(id!);

  const mapWarehouseProductToForm = (
    data: WarehouseProductResource
  ): Partial<WarehouseProductSchema> => ({
    warehouse_id: data?.warehouse_id.toString() || "",
    product_id:
      preselectedProductId?.toString() || data?.product_id.toString() || "",
    stock: data?.stock || 0,
    min_stock: data?.min_stock,
    max_stock: data?.max_stock,
  });

  const { isSubmitting, updateWarehouseProduct, createWarehouseProduct } =
    useWarehouseProductStore();

  const handleSubmit = async (data: WarehouseProductSchema) => {
    if (mode === "create") {
      await createWarehouseProduct(data)
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
      await updateWarehouseProduct(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchWarehouseProduct();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "update")
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingWarehouseProduct;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && warehouseProduct ? (
        <WarehouseProductForm
          defaultValues={mapWarehouseProductToForm(warehouseProduct)}
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
