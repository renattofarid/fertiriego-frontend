import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { UserForm } from "./UserForm";
import { USER, type UserResource } from "../lib/User.interface";
import { useUser, useUsers } from "../lib/User.hook";
import type { TypeDocument, TypePerson, UserSchema } from "../lib/User.schema";
import { useUserStore } from "../lib/Users.store";
import { useAllTypeUsers } from "@/pages/type-users/lib/typeUser.hook";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = USER;

export default function UserModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useUsers();

  const {
    data: user,
    isFinding: findingUser,
    refetch: refetchUser,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useUser(id!);

  const mapUserToForm = (data: UserResource): Partial<UserSchema> => {
    return {
      names: data.person?.names ?? "",
      address: data.person?.address ?? "",
      business_name: data.person?.business_name ?? "",
      email: data.person?.email ?? "",
      father_surname: data.person?.father_surname ?? "",
      mother_surname: data.person?.mother_surname ?? "",
      number_document: data.person?.number_document ?? "",
      phone: data.person?.phone ?? "",
      type_document: (data.person?.type_document as TypeDocument) ?? "DNI",
      type_person: (data.person?.type_person as TypePerson) ?? "JURIDICA",
      username: data.username ?? "",
      rol_id: String(data.rol_id),
      password: "",
    };
  };

  const { isSubmitting, updateUser } = useUserStore();

  const handleSubmit = async (data: UserSchema) => {
    await updateUser(id!, data)
      .then(() => {
        onClose();
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
        refetchUser();
        refetch();
      })
      .catch(() => {
        errorToast(ERROR_MESSAGE(MODEL, "update"));
      });
  };
  const { data: typeUsers, isLoading: typeUsersLoading } = useAllTypeUsers();

  const isLoadingAny = isSubmitting || findingUser || typeUsersLoading;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {!isLoadingAny && user && typeUsers ? (
        <UserForm
          typeUsers={typeUsers}
          defaultValues={mapUserToForm(user)}
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
