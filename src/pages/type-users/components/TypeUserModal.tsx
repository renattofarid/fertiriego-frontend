import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { TypeUserSchema } from "../lib/typeUser.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { TYPE_USER, type TypeUserResource } from "../lib/typeUser.interface";
import { useTypeUser, useTypeUsers } from "../lib/typeUser.hook";
import { useTypeUserStore } from "../lib/typeUsers.store";
import { TypeUserForm } from "./TypeUserForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = TYPE_USER;

export default function TypeUserModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useTypeUsers();

  const {
    data: typeUser,
    isFinding: findingTypeUser,
    refetch: refetchTypeUser,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useTypeUser(id!);

  const mapTypeUserToForm = (
    data: TypeUserResource
  ): Partial<TypeUserSchema> => ({
    name: data.name,
  });

  const { isSubmitting, updateTypeUser } = useTypeUserStore();

  const handleSubmit = async (data: TypeUserSchema) => {
    await updateTypeUser(id!, data)
      .then(() => {
        onClose();
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
        refetchTypeUser();
        refetch();
      })
      .catch(() => {
        errorToast(ERROR_MESSAGE(MODEL, "update"));
      });
  };

  const isLoadingAny = isSubmitting || findingTypeUser;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && typeUser ? (
        <TypeUserForm
          defaultValues={mapTypeUserToForm(typeUser)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={onClose}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
