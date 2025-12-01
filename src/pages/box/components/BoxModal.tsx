import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { BoxSchema } from "../lib/box.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { BOX, type BoxResource } from "../lib/box.interface";
import { useBox, useBoxById } from "../lib/box.hook";
import { useBoxStore } from "../lib/box.store";
import { BoxForm } from "./BoxForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = BOX;

export default function BoxModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useBox();

  const {
    data: box,
    isFinding: findingBox,
    refetch: refetchBox,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useBoxById(id!);

  const mapBoxToForm = (data: BoxResource): Partial<BoxSchema> => ({
    name: data?.name || "",
    serie: data?.serie || "",
    branch_id: data?.branch_id?.toString() || "0",
  });

  const { isSubmitting, updateBox, createBox } = useBoxStore();

  const handleSubmit = async (data: BoxSchema) => {
    if (mode === "create") {
      await createBox(data)
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
      await updateBox(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchBox();
          refetch();
        })
        .catch(() => {
          errorToast(ERROR_MESSAGE(MODEL, "update"));
        });
    }
  };

  const isLoadingAny = isSubmitting || findingBox;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && box ? (
        <BoxForm
          defaultValues={mapBoxToForm(box)}
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