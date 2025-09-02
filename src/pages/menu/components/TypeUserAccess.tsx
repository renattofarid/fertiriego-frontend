"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useTypeUser } from "../../type-users/lib/typeUser.hook";
import { useOptionsMenus } from "../lib/menu.hook";
import FormSkeleton from "@/components/FormSkeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { errorToast, successToast } from "@/lib/core.function";
import { usePermissionStore } from "../lib/menu.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

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

  const { error, isSubmitting, setAccessTypeUser } = usePermissionStore();

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
      .catch(() => {
        errorToast(error ?? "Error al actualizar permisos");
      })
      .finally(() => {
        setOpen(false);
        authenticate();
      });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-auto md:overflow-hidden gap-0">
        <SheetHeader>
          <SheetTitle>Actualizar Permisos del Rol</SheetTitle>
          <SheetDescription className="text-xs">
            Seleccione los permisos que tendrá el rol{" "}
            <strong>{typeUser?.name}</strong>
          </SheetDescription>
        </SheetHeader>
        {isFinding || isLoading ? (
          <FormSkeleton />
        ) : (
          <div className="flex items-center justify-center p-4 h-full">
            <div className="flex flex-col items-center w-full h-full">
              <Form {...form}>
                <form
                  className="w-full flex flex-col gap-3 justify-between"
                  onSubmit={form.handleSubmit(handleSubmit)}
                >
                  <div className="h-full max-h-[min(70vh,700px)] overflow-y-auto flex flex-col gap-2">
                    {optionMenus.map((perm: any) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 text-xs font-medium"
                      >
                        <Checkbox
                          checked={!!checkedItems[perm.id]}
                          onCheckedChange={(val) =>
                            handleCheckboxChange(perm.id, !!val)
                          }
                        />
                        {perm.name}
                        {/* <span className="text-[10px] text-muted-foreground">
                          ({perm.action})
                        </span> */}
                      </label>
                    ))}
                  </div>

                  <div className="pt-4 w-full flex justify-end gap-2">
                    <Button type="submit">Guardar</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
