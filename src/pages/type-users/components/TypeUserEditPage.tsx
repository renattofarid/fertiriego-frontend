"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { TYPE_USER, type TypeUserResource } from "../lib/typeUser.interface";
import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import { TypeUserForm } from "./TypeUserForm";
import { useTypeUserStore } from "../lib/typeUsers.store";
import { useTypeUser, useTypeUsers } from "../lib/typeUser.hook";
import { GeneralModal } from "@/components/GeneralModal";
import type { TypeUserSchema } from "../lib/typeUser.schema";

const { TITLES, MODEL } = TYPE_USER;

export default function TypeUserEditPage({
  id,
  open,
  setOpen,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!id) return <NotFound />;

  const { data: typeUser, isFinding } = useTypeUser(id);
  const { refetch } = useTypeUsers();
  const { isSubmitting, updateTypeUser } = useTypeUserStore();

  const handleSubmit = async (data: TypeUserSchema) => {
    await updateTypeUser(id, data)
      .then(() => {
        setOpen(false);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
        refetch();
      })
      .catch(() => {
        errorToast(ERROR_MESSAGE(MODEL, "update"));
      });
  };

  const mapTypeUserToForm = (
    data: TypeUserResource
  ): Partial<TypeUserSchema> => ({
    name: data.name,
  });

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={TITLES.update.title}
      subtitle={TITLES.update.subtitle}
      maxWidth="max-w-(--breakpoint-lg)"
    >
      {isFinding || !typeUser ? (
        <FormSkeleton />
      ) : (
        <TypeUserForm
          defaultValues={mapTypeUserToForm(typeUser)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />
      )}
    </GeneralModal>
  );
}
