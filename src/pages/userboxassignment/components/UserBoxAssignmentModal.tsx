import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { UserBoxAssignmentSchema } from "../lib/userboxassignment.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { USERBOXASSIGNMENT, type UserBoxAssignmentResource } from "../lib/userboxassignment.interface";
import { useUserBoxAssignment, useUserBoxAssignmentById } from "../lib/userboxassignment.hook";
import { useUserBoxAssignmentStore } from "../lib/userboxassignment.store";
import { UserBoxAssignmentForm } from "./UserBoxAssignmentForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
  preselectedBoxId?: number;
  preselectedBoxName?: string;
}

const { MODEL, EMPTY } = USERBOXASSIGNMENT;

export default function UserBoxAssignmentModal({ id, open, title, mode, onClose, preselectedBoxId, preselectedBoxName }: Props) {
  const { refetch } = useUserBoxAssignment();

  const {
    data: userBoxAssignment,
    isFinding: findingUserBoxAssignment,
    refetch: refetchUserBoxAssignment,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useUserBoxAssignmentById(id!);

  const mapUserBoxAssignmentToForm = (data: UserBoxAssignmentResource): Partial<UserBoxAssignmentSchema> => ({
    user_id: data?.user_id?.toString() || "",
    box_id: data?.box_id?.toString() || "",
  });

  const { isSubmitting, updateUserBoxAssignment, createUserBoxAssignment } = useUserBoxAssignmentStore();

  const handleSubmit = async (data: UserBoxAssignmentSchema) => {
    if (mode === "create") {
      await createUserBoxAssignment(data)
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
      await updateUserBoxAssignment(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          refetchUserBoxAssignment();
          refetch();
        })
        .catch(() => {
          errorToast(ERROR_MESSAGE(MODEL, "edit"));
        });
    }
  };

  const isLoadingAny = isSubmitting || findingUserBoxAssignment;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && userBoxAssignment ? (
        <UserBoxAssignmentForm
          defaultValues={mapUserBoxAssignmentToForm(userBoxAssignment)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
          preselectedBoxId={preselectedBoxId}
          preselectedBoxName={preselectedBoxName}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
