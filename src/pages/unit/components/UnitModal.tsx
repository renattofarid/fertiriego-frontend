import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { UnitSchema } from "../lib/unit.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { UNIT, type UnitResource } from "../lib/unit.interface";
import { useUnit, useUnitById } from "../lib/unit.hook";
import { useUnitStore } from "../lib/unit.store";
import { UnitForm } from "./UnitForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = UNIT;

export default function UnitModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useUnit();

  const {
    data: unit,
    isFinding: findingUnit,
    refetch: refetchUnit,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useUnitById(id!);

  const mapUnitToForm = (data: UnitResource): Partial<UnitSchema> => ({
    name: data?.name || "",
    code: data?.code || "",
  });

  const { isSubmitting, updateUnit, createUnit } = useUnitStore();

  const handleSubmit = async (data: UnitSchema) => {
    if (mode === "create") {
      await createUnit(data)
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
      await updateUnit(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchUnit();
          refetch();
        })
        .catch(() => {
          errorToast(ERROR_MESSAGE(MODEL, "update"));
        });
    }
  };

  const isLoadingAny = isSubmitting || findingUnit;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && unit ? (
        <UnitForm
          defaultValues={mapUnitToForm(unit)}
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