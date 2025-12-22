import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { VehicleSchema } from "../lib/vehicle.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { VEHICLE, type VehicleResource } from "../lib/vehicle.interface";
import { useVehicle, useVehicleById } from "../lib/vehicle.hook";
import { useVehicleStore } from "../lib/vehicle.store";
import { VehicleForm } from "./VehicleForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = VEHICLE;

export default function VehicleModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useVehicle();

  const {
    data: vehicle,
    isFinding: findingVehicle,
    refetch: refetchVehicle,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useVehicleById(id!);

  const mapVehicleToForm = (data: VehicleResource): Partial<VehicleSchema> => ({
    plate: data?.plate || "",
    brand: data?.brand || "",
    model: data?.model || "",
    year: data?.year || new Date().getFullYear(),
    color: data?.color || "",
    vehicle_type: data?.vehicle_type || "",
    max_weight: data?.max_weight ? parseFloat(data.max_weight) : 0,
    owner_id: data?.owner?.id.toString() || "",
    observations: data?.observations || "",
  });

  const { isSubmitting, updateVehicle, createVehicle } = useVehicleStore();

  const handleSubmit = async (data: VehicleSchema) => {
    if (mode === "create") {
      await createVehicle(data)
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
      await updateVehicle(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchVehicle();
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

  const isLoadingAny = isSubmitting || findingVehicle;

  return (
    <GeneralModal open={open} onClose={onClose} title={title} size="xl">
      {!isLoadingAny && vehicle ? (
        <VehicleForm
          defaultValues={mapVehicleToForm(vehicle)}
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
