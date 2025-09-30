import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { RoleSchema } from "../lib/role.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { ROLE, type RoleResource } from "../lib/role.interface";
import { useRoles, useRoleById } from "../lib/role.hook";
import { useRoleStore } from "../lib/role.store";
import { RoleForm } from "./RoleForm";

interface Props {
  roleId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const { MODEL, EMPTY } = ROLE;

export default function RoleModal({ roleId, open, onOpenChange, onSuccess }: Props) {
  const { refetch } = useRoles();
  const mode = roleId ? "update" : "create";
  const title = roleId ? `Editar ${MODEL.name}` : `Crear ${MODEL.name}`;

  const {
    data: role,
    isFinding: findingRole,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
      }
    : useRoleById(roleId!);

  const mapRoleToForm = (data: RoleResource): Partial<RoleSchema> => ({
    name: data?.name || "",
    code: data?.code || "",
  });

  const { isSubmitting, updateRole, createRole } = useRoleStore();

  const handleSubmit = async (data: RoleSchema) => {
    if (mode === "create") {
      await createRole(data)
        .then(() => {
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
          onSuccess?.();
          onOpenChange(false);
        })
        .catch((error) => {
          errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "create"));
        });
    } else {
      await updateRole(roleId!, data)
        .then(() => {
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetch();
          onSuccess?.();
          onOpenChange(false);
        })
        .catch((error) => {
          errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "update"));
        });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <GeneralModal open={open} onClose={handleClose} title={title}>
      {findingRole ? (
        <FormSkeleton />
      ) : (
        <RoleForm
          initialData={role}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleClose}
        />
      )}
    </GeneralModal>
  );
}