import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormTextArea } from "@/components/FormTextArea";
import { FormSwitch } from "@/components/FormSwitch";
import { useUbigeosFrom } from "@/pages/guide/lib/ubigeo.hook";
import { Loader } from "lucide-react";
import { FormSelectAsync } from "@/components/FormSelectAsync";

const addressSchema = z.object({
  direccion: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(500, "La dirección no puede exceder 500 caracteres"),
  district_id: z.coerce.number().min(1, "Seleccione un distrito"),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface PersonAddressFormProps {
  initialData?: Partial<AddressFormValues>;
  onSubmit: (data: AddressFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function PersonAddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Guardar",
}: PersonAddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      direccion: initialData?.direccion ?? "",
      district_id: initialData?.district_id ?? 0,
      is_default: initialData?.is_default ?? false,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => { e.stopPropagation(); form.handleSubmit(onSubmit)(e); }}
        className="space-y-4"
      >
        <FormSelectAsync
          control={form.control}
          name="district_id"
          label="Distrito"
          placeholder="Seleccione un distrito"
          useQueryHook={useUbigeosFrom}
          mapOptionFn={(u) => ({
            value: String(u.id),
            label: u.name,
            description: u.cadena,
          })}
          required
        />
        
        <FormTextArea
          control={form.control}
          name="direccion"
          label="Dirección"
          required
          placeholder="Ingrese la dirección completa"
          uppercase
          rows={3}
        />

        <FormSwitch
          control={form.control}
          name="is_default"
          text="Dirección predeterminada"
          textDescription="Esta será la dirección principal de la persona"
          autoHeight
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader className="h-4 w-4 animate-spin mr-2" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
