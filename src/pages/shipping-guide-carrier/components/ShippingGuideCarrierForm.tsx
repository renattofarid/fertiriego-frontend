import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TitleFormComponent from "@/components/TitleFormComponent";
import FormWrapper from "@/components/FormWrapper";
import {
  SHIPPING_GUIDE_CARRIER,
  UNIT_MEASUREMENTS,
} from "../lib/shipping-guide-carrier.interface";
import { shippingGuideCarrierSchema } from "../lib/shipping-guide-carrier.schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader } from "lucide-react";

export type ShippingGuideCarrierFormValues = {
  carrier_id: string;
  issue_date: string;
  transfer_start_date: string;
  shipping_guide_remittent_id: string;
  driver_id: string;
  vehicle_id: string;
  secondary_vehicle_id: string | undefined;
  driver_license: string;
  origin_address: string;
  origin_ubigeo_id: string;
  destination_address: string;
  destination_ubigeo_id: string;
  observations?: string;
  details: {
    product_id: string;
    description: string;
    quantity: string;
    unit: string;
    weight: string;
  }[];
};

const defaultValues: ShippingGuideCarrierFormValues = {
  carrier_id: "",
  issue_date: "",
  transfer_start_date: "",
  shipping_guide_remittent_id: "",
  driver_id: "",
  vehicle_id: "",
  secondary_vehicle_id: "",
  driver_license: "",
  origin_address: "",
  origin_ubigeo_id: "",
  destination_address: "",
  destination_ubigeo_id: "",
  observations: "",
  details: [
    {
      product_id: "",
      description: "",
      quantity: "",
      unit: UNIT_MEASUREMENTS[0].value,
      weight: "",
    },
  ],
};

interface ShippingGuideCarrierFormProps {
  mode?: "create" | "update";
  onSubmit: (values: ShippingGuideCarrierFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: ShippingGuideCarrierFormValues;
}

export function ShippingGuideCarrierForm({
  mode = "create",
  onSubmit,
  isSubmitting = false,
  initialValues,
}: ShippingGuideCarrierFormProps) {
  const { ROUTE, MODEL, ICON } = SHIPPING_GUIDE_CARRIER;
  const navigate = useNavigate();

  const form = useForm<ShippingGuideCarrierFormValues>({
    resolver: zodResolver(shippingGuideCarrierSchema) as Resolver<ShippingGuideCarrierFormValues>,
    defaultValues: initialValues ?? {
      ...defaultValues,
      details: defaultValues.details.map((d) => ({ ...d })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode={mode} icon={ICON} />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="carrier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transportista (ID)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shipping_guide_remittent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remitente (ID)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 8" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="driver_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conductor (ID)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehículo (ID)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondary_vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehículo Secundario (ID)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="driver_license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Licencia del Conductor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: B12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issue_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Emisión</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transfer_start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Inicio de Traslado</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="origin_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de Origen</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle, número, ciudad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de Destino</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle, número, ciudad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin_ubigeo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubigeo de Origen (ID)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 150101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination_ubigeo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubigeo de Destino (ID)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 150102" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Notas adicionales" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Detalles</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    product_id: "",
                    description: "",
                    quantity: "",
                    unit: UNIT_MEASUREMENTS[0].value,
                    weight: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Agregar ítem
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border p-3 rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`details.${index}.product_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Producto (ID)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`details.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input placeholder="Detalle del producto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`details.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`details.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            {UNIT_MEASUREMENTS.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`details.${index}.weight`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-5 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTE)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : mode === "create" ? "Guardar" : "Actualizar"}
            </Button>
          </div>
        </form>
      </Form>
    </FormWrapper>
  );
}
