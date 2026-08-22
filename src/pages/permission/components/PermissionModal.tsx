import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { PermissionSchema } from "../lib/permission.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PERMISSION, type PermissionResource } from "../lib/permission.interface";
import { usePermissions, usePermissionById } from "../lib/permission.hook";
import { usePermissionStore } from "../lib/permission.store";
import { PermissionForm } from "./PermissionForm";
import { useAllMenuGroups } from "@/pages/menu-group/lib/menuGroup.hook";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY } = PERMISSION;

export default function PermissionModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = usePermissions();
  const menuGroups = useAllMenuGroups();

  const { data: permission, isFinding: findingPermission } =
    mode === "create" ? { data: null, isFinding: false } : usePermissionById(id!);

  const mapToForm = (
    data: Pick<
      PermissionResource,
      "name" | "route" | "group_menu_id" | "action" | "type" | "status"
    >
  ): Partial<PermissionSchema> => ({
    name: data.name,
    route: data.route,
    group_menu_id: String(data.group_menu_id),
    action: data.action ?? "list",
    type: data.type ?? "modulo",
    status: data.status,
  });

  const { isSubmitting, createPermission, updatePermission } =
    usePermissionStore();

  const handleSubmit = async (data: PermissionSchema) => {
    if (mode === "create") {
      await createPermission({
        name: data.name!,
        route: data.route!,
        group_menu_id: Number(data.group_menu_id),
        action: data.action!,
        type: data.type!,
      })
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response?.data?.message ??
              error.response?.data?.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updatePermission(id!, {
        name: data.name,
        route: data.route,
        group_menu_id: data.group_menu_id ? Number(data.group_menu_id) : undefined,
        action: data.action,
        type: data.type,
        status: data.status,
      })
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "edit"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response?.data?.message ??
              error.response?.data?.error ??
              ERROR_MESSAGE(MODEL, "edit")
          );
        });
    }
  };

  const formData = mode === "create" ? EMPTY : permission;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {mode === "create" || (!findingPermission && formData) ? (
        <PermissionForm
          defaultValues={
            mode === "create"
              ? EMPTY
              : mapToForm(formData as PermissionResource)
          }
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
          menuGroups={menuGroups}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
