import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { MenuGroupSchema } from "../lib/menuGroup.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { MENU_GROUP, type MenuGroupResource } from "../lib/menuGroup.interface";
import { useMenuGroups, useAllMenuGroups, useMenuGroupById } from "../lib/menuGroup.hook";
import { useMenuGroupStore } from "../lib/menuGroup.store";
import { MenuGroupForm } from "./MenuGroupForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
}

const { MODEL, EMPTY } = MENU_GROUP;

export default function MenuGroupModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useMenuGroups();
  const allMenuGroups = useAllMenuGroups();

  const { data: menuGroup, isFinding: findingMenuGroup } =
    mode === "create" ? { data: null, isFinding: false } : useMenuGroupById(id!);

  const mapToForm = (
    data: Pick<MenuGroupResource, "name" | "icon" | "group_menu_id" | "status">
  ): Partial<MenuGroupSchema> => ({
    name: data.name,
    icon: data.icon,
    group_menu_id: data.group_menu_id ? String(data.group_menu_id) : "",
    status: data.status,
  });

  const { isSubmitting, createMenuGroup, updateMenuGroup } = useMenuGroupStore();

  const handleSubmit = async (data: MenuGroupSchema) => {
    const groupMenuId = data.group_menu_id ? Number(data.group_menu_id) : null;

    if (mode === "create") {
      await createMenuGroup({
        name: data.name!,
        icon: data.icon!,
        group_menu_id: groupMenuId,
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
      await updateMenuGroup(id!, {
        name: data.name,
        icon: data.icon,
        group_menu_id: groupMenuId,
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

  const formData = mode === "create" ? EMPTY : menuGroup;
  const parentOptions = allMenuGroups.filter(
    (m) => m.group_menu_id === null && m.id !== id
  );

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {mode === "create" || (!findingMenuGroup && formData) ? (
        <MenuGroupForm
          defaultValues={
            mode === "create"
              ? EMPTY
              : mapToForm(formData as MenuGroupResource)
          }
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
          parentOptions={parentOptions}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
