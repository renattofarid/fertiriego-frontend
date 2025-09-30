import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  roleCreateSchema,
  roleUpdateSchema,
  type RoleSchema,
} from "../lib/role.schema";
import type { RoleResource } from "../lib/role.interface";
import { Shield, Save } from "lucide-react";

interface RoleFormProps {
  initialData?: RoleResource | null;
  onSubmit: (data: RoleSchema) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function RoleForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: RoleFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? roleUpdateSchema : roleCreateSchema;

  const form = useForm<RoleSchema>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
    },
  });

  const handleSubmit = async (data: RoleSchema) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input
                  placeholder="ADMIN, USER, WORKER..."
                  {...field}
                  className="font-mono"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Administrador, Usuario, Trabajador..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                {isEditing ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>
                {isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {isEditing ? "Actualizar" : "Crear"} Rol
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
