import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";

import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../lib/Users.store";
import { useUsers } from "../lib/User.hook";
import { UserForm } from "./UserForm";
import { Plus } from "lucide-react";
import type { UserSchema } from "../lib/User.schema";
import { USER } from "../lib/User.interface";

const { TITLES, MODEL } = USER;

export default function UserAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createUser } = useUserStore();
  const { refetch } = useUsers();

  const handleSubmit = async (data: UserSchema) => {
    await createUser(data)
      .then(() => {
        setOpen(false);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
        refetch();
      })
      .catch(() => {
        errorToast(ERROR_MESSAGE(MODEL, "create"));
      });
  };

  return (
    <>
      <Button
        size="sm"
        className="ml-auto !px-10"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar
      </Button>
      <GeneralModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={TITLES.create.title}
        subtitle={TITLES.create.subtitle}
        maxWidth="!max-w-(--breakpoint-md)"
      >
        <UserForm
          defaultValues={{ usuario: "" }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={() => setOpen(false)}
        />
      </GeneralModal>
    </>
  );
}
