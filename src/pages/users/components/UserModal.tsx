import { useEffect, useRef } from "react";
import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
  warningToast,
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
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY } = USER;

export default function UserModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useUsers();
  const errorShownRef = useRef(false);

  const {
    data: user,
    isLoading: findingUser,
    refetch: refetchUser,
    error: userError,
  } = mode === "create"
    ? ({
        data: EMPTY,
        isLoading: false,
        refetch: refetch,
        error: null,
      } as any)
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

  const { isSubmitting, updateUser, createUser } = useUserStore();

  const handleSubmit = async (data: UserSchema) => {
    if (mode === "create") {
      await createUser(data)
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
      await updateUser(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          refetchUser();
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

  const { data: typeUsers, isLoading: typeUsersLoading } = useAllTypeUsers();

  const isLoadingAny = isSubmitting || findingUser || typeUsersLoading;

  useEffect(() => {
    if (userError && mode === "edit" && !errorShownRef.current) {
      const error = userError as any;
      warningToast(error?.response?.data?.message ?? "Error al cargar el usuario");
      errorShownRef.current = true;
      onClose();
    }
  }, [userError, mode, onClose]);

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
