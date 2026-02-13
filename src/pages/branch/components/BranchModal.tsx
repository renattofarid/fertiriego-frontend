import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { BranchSchema } from "../lib/branch.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { BRANCH, type BranchResource } from "../lib/branch.interface";
import { useBranch, useBranchById } from "../lib/branch.hook";
import { useBranchStore } from "../lib/branch.store";
import { BranchForm } from "./BranchForm";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY, ICON } = BRANCH;

export default function BranchModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useBranch();
  const { user } = useAuthStore();

  const {
    data: branch,
    isLoading: findingBranch,
    refetch: refetchBranch,
  } = mode === "create"
    ? {
        data: EMPTY,
        isLoading: false,
        refetch: refetch,
      }
    : useBranchById(id!);

  const mapBranchToForm = (data: BranchResource): Partial<BranchSchema> => ({
    name: data?.name || "",
    address: data?.address || "",
    is_invoice: Boolean(data?.is_invoice) === true,
    has_igv: Boolean(data?.has_igv) === true,
    responsible_id: user?.id || data?.responsible_id || 0,
    phone: data?.phone || "",
    email: data?.email || "",
    company_id: data?.company_id.toString() || "0",
  });

  const { isSubmitting, updateBranch, createBranch } = useBranchStore();

  const handleSubmit = async (data: BranchSchema) => {
    if (mode === "create") {
      await createBranch(data)
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
              ERROR_MESSAGE(MODEL, "create"),
          );
        });
    } else {
      await updateBranch(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          refetchBranch();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "edit"),
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingBranch;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      icon={ICON}
      size="2xl"
      titleComponent={true}
      mode={mode}
    >
      {!isLoadingAny && branch ? (
        <BranchForm
          defaultValues={mapBranchToForm(branch)}
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
