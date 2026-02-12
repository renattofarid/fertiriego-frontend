"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  userBoxAssignmentSchemaCreate,
  userBoxAssignmentSchemaUpdate,
  type UserBoxAssignmentSchema,
} from "../lib/userboxassignment.schema.ts";
import { Loader } from "lucide-react";
import { useAllBoxes } from "@/pages/box/lib/box.hook";
import { FormSelect } from "@/components/FormSelect";
import { useEffect, useState } from "react";
import { getAllUsers } from "@/pages/users/lib/User.actions";
import type { UserResource } from "@/pages/users/lib/User.interface";
import { getUserBoxAssignmentsByBoxId } from "../lib/userboxassignment.actions";

interface UserBoxAssignmentFormProps {
  defaultValues: Partial<UserBoxAssignmentSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  preselectedBoxId?: number;
  preselectedBoxName?: string;
}

export const UserBoxAssignmentForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  preselectedBoxId,
  preselectedBoxName,
}: UserBoxAssignmentFormProps) => {
  const { data: boxes, isLoading: loadingBoxes } = useAllBoxes();
  const [users, setUsers] = useState<UserResource[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState<number[]>([]);

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? userBoxAssignmentSchemaCreate
        : userBoxAssignmentSchemaUpdate
    ),
    defaultValues: {
      user_id: defaultValues.user_id || "",
      box_id: preselectedBoxId
        ? preselectedBoxId.toString()
        : defaultValues.box_id || "",
    },
    mode: "onChange",
  });

  const selectedBoxId = form.watch("box_id");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Cargar usuarios ya asignados a la caja cuando cambie la caja seleccionada
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      const boxId = preselectedBoxId || selectedBoxId;
      if (boxId) {
        try {
          const assignments = await getUserBoxAssignmentsByBoxId(Number(boxId));
          // Obtener IDs de todos los usuarios asignados (activos e inactivos)
          const userIds = assignments.map((assignment) => assignment.user_id);
          setAssignedUserIds(userIds);
        } catch (error) {
          console.error("Error loading assigned users:", error);
          setAssignedUserIds([]);
        }
      } else {
        setAssignedUserIds([]);
      }
    };
    fetchAssignedUsers();
  }, [preselectedBoxId, selectedBoxId]);

  // Cuando hay una caja preseleccionada, actualizar el valor del campo
  useEffect(() => {
    if (preselectedBoxId) {
      form.setValue("box_id", preselectedBoxId.toString(), {
        shouldValidate: true,
      });
    }
  }, [preselectedBoxId, form]);

  // Filtrar usuarios que ya están asignados
  const availableUsers = users.filter((user) => !assignedUserIds.includes(user.id));

  const userOptions =
    availableUsers?.map((user) => ({
      value: user.id.toString(),
      label: user.name,
    })) || [];

  const boxOptions =
    boxes?.map((box) => ({
      value: box.id.toString(),
      label: box.name,
    })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4 bg-sidebar p-4 rounded-lg">
          {preselectedBoxId && preselectedBoxName && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Caja seleccionada:
              </p>
              <p className="font-semibold">{preselectedBoxName}</p>
            </div>
          )}

          <FormSelect
            name="user_id"
            label="Usuario"
            placeholder="Seleccione un usuario"
            options={userOptions}
            control={form.control}
            disabled={loadingUsers}
          />

          {!preselectedBoxId && (
            <FormSelect
              name="box_id"
              label="Caja"
              placeholder="Seleccione una caja"
              options={boxOptions}
              control={form.control}
              disabled={loadingBoxes}
            />
          )}
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Asignando" : "Asignar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
