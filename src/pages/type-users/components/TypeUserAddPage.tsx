import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { TypeUserForm } from "./TypeUserForm";
import { useTypeUserStore } from "../lib/typeUsers.store";
import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTypeUsers } from "../lib/typeUser.hook";
import { Plus } from "lucide-react";
import type { TypeUserSchema } from "../lib/typeUser.schema";
import { TYPE_USER } from "../lib/typeUser.interface";

const { TITLES, MODEL } = TYPE_USER;

export default function TypeUserAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createTypeUser } = useTypeUserStore();
  const { refetch } = useTypeUsers();

  const handleSubmit = async (data: TypeUserSchema) => {
    await createTypeUser(data)
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
        maxWidth="!max-w-(--breakpoint-sm)"
      >
        <TypeUserForm
          defaultValues={{}}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={() => setOpen(false)}
        />
      </GeneralModal>
    </>
  );
}
