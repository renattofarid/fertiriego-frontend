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
import { useVehicles, useVehicleById } from "../lib/vehicle.hook";
import { useVehicleStore } from "../lib/vehicle.store";
import { VehicleForm } from "./VehicleForm";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY, ICON } = VEHICLE;

export default function VehicleModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useVehicles();

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
    mtc: data?.mtc || "",
    owner_id: data?.owner?.id.toString() || "",
    observations: data?.observations || "",
  });

  const { isSubmitting, updateVehicle, createVehicle } = useVehicleStore();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: VehicleSchema) => {
    if (mode === "create") {
      await createVehicle(data)
        .then(async () => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          await queryClient.invalidateQueries({ queryKey: [VEHICLE.QUERY_KEY] });
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create"),
          );
        });
    } else {
      await updateVehicle(id!, data)
        .then(async () => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          await queryClient.invalidateQueries({ queryKey: [VEHICLE.QUERY_KEY] });
          refetchVehicle();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "edit"),
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingVehicle;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Complete el formulario para registrar un nuevo vehículo"
      size="xl"
      icon={ICON}
    >
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
