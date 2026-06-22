import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { TagSchema } from "../lib/product-tag.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT_TAG, type TagResource } from "../lib/product-tag.interface";
import { useProductTag, useProductTagById } from "../lib/product-tag.hook";
import { useProductTagStore } from "../lib/product-tag.store";
import { TagForm } from "./TagForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY } = PRODUCT_TAG;

export default function TagModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useProductTag();

  const {
    data: tag,
    isFinding: findingTag,
    refetch: refetchTag,
  } =
    mode === "create"
      ? { data: EMPTY, isFinding: false, refetch }
      : useProductTagById(id!);

  const mapTagToForm = (data: TagResource): Partial<TagSchema> => ({
    name: data.name,
    color: data.color,
    type: data.type,
    description: data.description ?? "",
    is_active: data.is_active,
  });

  const { isSubmitting, createTag, updateTag } = useProductTagStore();

  const handleSubmit = async (data: TagSchema) => {
    if (mode === "create") {
      await createTag(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error?.response?.data?.message ??
              error?.response?.data?.error ??
              ERROR_MESSAGE(MODEL, "create"),
          );
        });
    } else {
      await updateTag(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          refetchTag();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error?.response?.data?.message ??
              error?.response?.data?.error ??
              ERROR_MESSAGE(MODEL, "edit"),
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingTag;

  return (
    <GeneralModal open={open} onClose={onClose} title={title} maxWidth="!max-w-2xl">
      {!isLoadingAny && tag ? (
        <TagForm
          defaultValues={mapTagToForm(tag)}
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
