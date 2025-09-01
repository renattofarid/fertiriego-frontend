"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTypeUser } from "../../type-users/lib/typeUser.hook";
import { useOptionsMenus } from "../../permissions/lib/permission.hook"; // <--- tu hook
import FormSkeleton from "@/components/FormSkeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CheckedItems {
  [key: number]: boolean;
}

const TypeUser = z.object({
  permisos: z.array(z.number()),
});

interface Props {
  id: number;
  open: boolean;
  onClose: () => void;
}

const mockOptionMenus = [
  {
    id: 1,
    name: "Usuarios",
    items: [
      { id: 1, action: "Leer", route: "users.index" },
      { id: 2, action: "Crear", route: "users.store" },
      { id: 3, action: "Editar", route: "users.update" },
      { id: 4, action: "Eliminar", route: "users.destroy" },
    ],
  },
  {
    id: 2,
    name: "Roles",
    items: [
      { id: 5, action: "Leer", route: "roles.index" },
      { id: 6, action: "Asignar Permiso", route: "roles.assign" },
      { id: 7, action: "Revocar Permiso", route: "roles.revoke" },
    ],
  },
];

export function TypeUserPermissions({ id, open, onClose }: Props) {
  const form = useForm<z.infer<typeof TypeUser>>({
    resolver: zodResolver(TypeUser),
    defaultValues: {
      permisos: [],
    },
  });

  const { data: typeUser, isFinding } = useTypeUser(id);
  // const { data: optionMenus, isLoadingOption } = useOptionsMenus(); // <--- hook dinámico
  const optionMenus = mockOptionMenus;
  const isLoadingOption = false;
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});

  const handleCheckboxChange = (parentId: number, childId?: number) => {
    setCheckedItems((prev) => {
      const updated = { ...prev };

      if (!childId) {
        // toggle parent
        if (updated[parentId]) {
          delete updated[parentId];
        } else {
          updated[parentId] = true;
        }
      } else {
        // toggle child
        if (updated[childId]) {
          delete updated[childId];
        } else {
          updated[childId] = true;
        }
      }

      return updated;
    });
  };

  const loadForm = useCallback(async () => {
    if (typeUser) {
      const typeUserData: any = await typeUser;
      setCheckedItems({});

      const permisosIds = typeUserData.permissions.map((p: any) => p.id);

      form.reset({
        permisos: permisosIds,
      });

      setCheckedItems(() => {
        const updated: CheckedItems = {};
        permisosIds.forEach((id: number) => {
          updated[id] = true;
        });
        return updated;
      });
    }
  }, [typeUser, id]);

  useEffect(() => {
    loadForm();
  }, [loadForm, id]);

  if (isFinding || isLoadingOption) return <FormSkeleton />;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-auto gap-0">
        <SheetHeader>
          <SheetTitle>Actualizar Rol</SheetTitle>
          <SheetDescription className="text-xs">
            Llene los campos para actualizar el rol
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center w-full">
            <Form {...form}>
              <form
                className="w-full flex flex-col gap-3"
                onSubmit={form.handleSubmit((values) => {
                  // aquí puedes incluir checkedItems -> permisos seleccionados
                  console.log({
                    ...values,
                    permisos: Object.keys(checkedItems).map(Number),
                  });
                })}
              >
                <h1 className="text-lg font-medium">Permisos</h1>

                {mockOptionMenus.map((module) => (
                  <div key={module.id} className="w-full">
                    {/* Parent */}
                    <div className="flex items-center">
                      <label
                        htmlFor={`parent-${module.id}`}
                        className="w-full flex items-center gap-2 text-xs font-medium leading-none"
                      >
                        <Checkbox
                          id={`parent-${module.id}`}
                          checked={!!checkedItems[module.id]}
                          onCheckedChange={() =>
                            handleCheckboxChange(module.id)
                          }
                        />
                        {module.name}
                      </label>
                    </div>

                    {/* Children */}
                    {module.items && (
                      <div className="flex flex-col pl-4 pt-2">
                        {module.items.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2"
                          >
                            <label
                              htmlFor={`child-${perm.id}`}
                              className="w-full flex items-center gap-2 py-1 text-xs leading-none"
                            >
                              <Checkbox
                                id={`child-${perm.id}`}
                                checked={!!checkedItems[perm.id]}
                                onCheckedChange={() =>
                                  handleCheckboxChange(module.id, perm.id)
                                }
                              />
                              {perm.action}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </form>
            </Form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
