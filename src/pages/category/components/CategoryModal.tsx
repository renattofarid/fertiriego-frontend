import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { CategorySchema } from "../lib/category.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { CATEGORY, type CategoryResource } from "../lib/category.interface";
import {
  useCategory,
  useCategoryById,
  useAllCategories,
} from "../lib/category.hook";
import { useCategoryStore } from "../lib/category.store";
import { CategoryForm } from "./CategoryForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = CATEGORY;

export default function CategoryModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useCategory();
  const { data: allCategories, refetch: refetchAllCategories } =
    useAllCategories();

  const {
    data: category,
    isFinding: findingCategory,
    refetch: refetchCategory,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useCategoryById(id!);

  const mapCategoryToForm = (
    data: CategoryResource
  ): Partial<CategorySchema> => ({
    name: data.name,
    code: data.code,
    parent_id: data.parent_id ? data.parent_id.toString() : "null",
  });

  const { isSubmitting, updateCategory, createCategory } = useCategoryStore();

  const handleSubmit = async (data: CategorySchema) => {
    if (mode === "create") {
      await createCategory(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
          refetchAllCategories();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateCategory(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchCategory();
          refetch();
          refetchAllCategories();
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

  const isLoadingAny = isSubmitting || findingCategory;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-2xl"
    >
      {!isLoadingAny && category && allCategories ? (
        <CategoryForm
          defaultValues={mapCategoryToForm(category)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
          categories={allCategories}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
