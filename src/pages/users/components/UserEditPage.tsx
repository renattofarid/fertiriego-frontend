"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";

import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";

import { GeneralModal } from "@/components/GeneralModal";
import { useUser, useUsers } from "../lib/User.hook";
import { useUserStore } from "../lib/Users.store";
import { UserForm } from "./UserForm";
import type { UserSchema } from "../lib/User.schema";
import { USER, type UserResource } from "../lib/User.interface";

const { TITLES, MODEL } = USER;

export default function UserEditPage({
  id,
  open,
  setOpen,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!id) return <NotFound />;

  const { data: User, isFinding } = useUser(id);
  const { refetch } = useUsers();
  const { isSubmitting, updateUser } = useUserStore();

  const handleSubmit = async (data: UserSchema) => {
    await updateUser(id, data)
      .then(() => {
        setOpen(false);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
        refetch();
      })
      .catch(() => {
        errorToast(ERROR_MESSAGE(MODEL, "update"));
      });
  };

  const mapUserToForm = (data: UserResource): Partial<UserSchema> => ({
    nombres: data.nombres,
    apellidos: data.apellidos,
    usuario: data.usuario,
    tipo_usuario_id: data.tipo_usuario_id,
    password: data.password,
  });

  if (!isFinding && !User) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={TITLES.update.title}
      subtitle={TITLES.update.subtitle}
      maxWidth="max-w-(--breakpoint-sm)"
    >
      {isFinding || !User ? (
        <FormSkeleton />
      ) : (
        <UserForm
          defaultValues={mapUserToForm(User)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />
      )}
    </GeneralModal>
  );
}
