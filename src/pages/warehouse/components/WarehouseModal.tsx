import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { WarehouseSchema } from "../lib/warehouse.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { WAREHOUSE, type WarehouseResource } from "../lib/warehouse.interface";
import { useWarehouse, useWarehouseById } from "../lib/warehouse.hook";
import { useWarehouseStore } from "../lib/warehouse.store";
import { WarehouseForm } from "./WarehouseForm";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = WAREHOUSE;

export default function WarehouseModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useWarehouse();
  const { user } = useAuthStore();

  const {
    data: warehouse,
    isFinding: findingWarehouse,
    refetch: refetchWarehouse,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useWarehouseById(id!);

  const mapWarehouseToForm = (
    data: WarehouseResource
  ): Partial<WarehouseSchema> => ({
    name: data?.name || "",
    address: data?.address || "",
    capacity: data?.capacity || 0,
    responsible_id: user?.id || data?.responsible_id || 0,
    phone: data?.phone || "",
    email: data?.email || "",
    branch_id: data?.branch_id?.toString() || "0",
  });

  const { isSubmitting, updateWarehouse, createWarehouse } =
    useWarehouseStore();

  const handleSubmit = async (data: WarehouseSchema) => {
    if (mode === "create") {
      await createWarehouse(data)
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
      await updateWarehouse(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchWarehouse();
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

  const isLoadingAny = isSubmitting || findingWarehouse;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && warehouse ? (
        <WarehouseForm
          defaultValues={mapWarehouseToForm(warehouse)}
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
