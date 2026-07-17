import { GeneralModal } from "@/components/GeneralModal";
import type { TagSchema } from "../lib/product-tag.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT_TAG, type TagResource } from "../lib/product-tag.interface";
import { useProductTag } from "../lib/product-tag.hook";
import { useProductTagStore } from "../lib/product-tag.store";
import { TagForm } from "./TagForm";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  tag?: TagResource;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY } = PRODUCT_TAG;

export default function TagModal({ tag, open, title, mode, onClose }: Props) {
  const { refetch } = useProductTag();
  const currentTag = mode === "create" ? EMPTY : tag!;

  const mapTagToForm = (data: TagResource): Partial<TagSchema> => ({
    name: data.name,
    color: data.color,
    type: data.type,
    description: data.description ?? "",
    is_active: data.is_active,
  });

  const { isSubmitting, createTag, updateTag } = useProductTagStore();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: TagSchema) => {
    if (mode === "create") {
      await createTag(data)
        .then(async () => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          await queryClient.invalidateQueries({ queryKey: [PRODUCT_TAG.QUERY_KEY] });
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
      await updateTag(currentTag.id, data)
        .then(async () => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          await queryClient.invalidateQueries({ queryKey: [PRODUCT_TAG.QUERY_KEY] });
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

  return (
    <GeneralModal open={open} onClose={onClose} title={title} maxWidth="!max-w-2xl">
      <TagForm
        defaultValues={mapTagToForm(currentTag)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode={mode}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
