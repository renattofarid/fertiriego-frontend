"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useTypeUser } from "../../type-users/lib/typeUser.hook";
import { useOptionsMenus } from "../lib/menu.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { errorToast, successToast } from "@/lib/core.function";
import { usePermissionStore } from "../lib/menu.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import GeneralSheet from "@/components/GeneralSheet";
import { TYPE_USER } from "@/pages/type-users/lib/typeUser.interface";

interface CheckedItems {
  [key: number]: boolean;
}

const TypeUser = z.object({
  permisos: z.array(z.number()),
});

interface Props {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function TypeUserAccess({ id, open, setOpen }: Props) {
  const form = useForm<z.infer<typeof TypeUser>>({
    resolver: zodResolver(TypeUser),
    defaultValues: {
      permisos: [],
    },
  });

  const { data: typeUser, isFinding } = useTypeUser(id);
  const { data: optionMenus, isLoading } = useOptionsMenus();
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});

  const { authenticate } = useAuthStore();

  // marcar los permisos que ya tiene el rol
  useEffect(() => {
    if (typeUser && optionMenus) {
      const typeUserData: any = typeUser;
      const permisosIds = typeUserData.permissions.map((p: any) => p.id);

      form.reset({ permisos: permisosIds });

      const updated: CheckedItems = {};
      permisosIds.forEach((id: number) => {
        updated[id] = true;
      });
      setCheckedItems(updated);
    }
  }, [typeUser, optionMenus, form]);

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const { isSubmitting, setAccessTypeUser } = usePermissionStore();

  const handleSubmit = async () => {
    const access = optionMenus.map((perm: any) => ({
      permission_id: perm.id,
      state: checkedItems[perm.id] ? 1 : 0,
    }));

    if (isSubmitting) return;
    setAccessTypeUser(id, { access })
      .then(() => {
        successToast("Permisos actualizados con éxito");
      })
      .catch((error: any) => {
        errorToast(
          error.response.data.message ??
            error.response.data.error ??
            error.response.data.error ??
            "Error al actualizar permisos",
        );
      })
      .finally(() => {
        setOpen(false);
        authenticate();
      });
  };

  return (
    <GeneralSheet
      open={open}
      onClose={() => setOpen(false)}
      title={`Permisos para ${typeUser?.name}`}
      subtitle={`Configura los permisos para el rol`}
      icon={TYPE_USER.ICON}
      footer={
        <div className="pt-4 w-full flex justify-end gap-2">
          <Button type="submit" disabled={id === 1}>
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      }
    >
      {isFinding || isLoading ? (
        <FormSkeleton />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center w-full h-full">
            <Form {...form}>
              <form
                className="w-full flex flex-col gap-3 justify-between"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div className="h-full flex flex-col gap-2">
                  {optionMenus.map((perm: any) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 text-xs font-medium"
                    >
                      <Checkbox
                        disabled={id === 1}
                        checked={!!checkedItems[perm.id]}
                        onCheckedChange={(val) =>
                          handleCheckboxChange(perm.id, !!val)
                        }
                      />
                      {perm.name}
                    </label>
                  ))}
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
