import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { BrandSchema } from "../lib/brand.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { BRAND, type BrandResource } from "../lib/brand.interface";
import { useBrand, useBrandById } from "../lib/brand.hook";
import { useBrandStore } from "../lib/brand.store";
import { BrandForm } from "./BrandForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY } = BRAND;

export default function BrandModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useBrand();

  const {
    data: brand,
    isFinding: findingBrand,
    refetch: refetchBrand,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useBrandById(id!);

  const mapBrandToForm = (data: BrandResource): Partial<BrandSchema> => ({
    name: data?.name || "",
    code: data?.code || "",
  });

  const { isSubmitting, updateBrand, createBrand } = useBrandStore();

  const handleSubmit = async (data: BrandSchema) => {
    if (mode === "create") {
      await createBrand(data)
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
      await updateBrand(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          refetchBrand();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            (error.response.data.message ?? error.response.data.error) ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "edit")
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingBrand;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && brand ? (
        <BrandForm
          defaultValues={mapBrandToForm(brand)}
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
