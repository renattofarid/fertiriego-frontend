"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  purchaseShippingGuideSchemaCreate,
  purchaseShippingGuideSchemaUpdate,
  type PurchaseShippingGuideSchema,
} from "../lib/purchase-shipping-guide.schema";
import {
  Loader,
  Plus,
  Trash2,
  Pencil,
  Info,
  BadgeInfo,
  Box,
  Car,
} from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UNIT_OPTIONS,
  TRANSPORT_MODALITY_OPTIONS,
} from "../lib/purchase-shipping-guide.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { useCarriers } from "@/pages/carrier/lib/carrier.hook";
import { useDrivers } from "@/pages/driver/lib/driver.hook";
import { useVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import { useRemittents } from "@/pages/person/lib/person.hook";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { UbigeoResource } from "@/pages/guide/lib/ubigeo.interface";
import type { VehicleResource } from "@/pages/vehicle/lib/vehicle.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useUbigeosFrom, useUbigeosTo } from "@/pages/guide/lib/ubigeo.hook";

interface PurchaseShippingGuideFormProps {
  defaultValues: Partial<PurchaseShippingGuideSchema>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  description: string;
  quantity: string;
  unit: string;
  weight: string;
}

export const PurchaseShippingGuideForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: PurchaseShippingGuideFormProps) => {
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    description: "",
    quantity: "",
    unit: "NIU",
    weight: "",
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseShippingGuideSchemaCreate
        : purchaseShippingGuideSchemaUpdate,
    ),
    defaultValues,
    mode: "onChange",
  });

  const detailTempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_description: currentDetail.description,
      temp_quantity: currentDetail.quantity,
      temp_unit: currentDetail.unit,
      temp_weight: currentDetail.weight,
    },
  });

  // Watchers
  const selectedProductId = detailTempForm.watch("temp_product_id");
  const selectedDescription = detailTempForm.watch("temp_description");
  const selectedQuantity = detailTempForm.watch("temp_quantity");
  const selectedUnit = detailTempForm.watch("temp_unit");
  const selectedWeight = detailTempForm.watch("temp_weight");

  // Sincronizar detalles
  useEffect(() => {
    detailTempForm.setValue("temp_product_id", currentDetail.product_id);
    detailTempForm.setValue("temp_description", currentDetail.description);
    detailTempForm.setValue("temp_quantity", currentDetail.quantity);
    detailTempForm.setValue("temp_unit", currentDetail.unit);
    detailTempForm.setValue("temp_weight", currentDetail.weight);
  }, [currentDetail, detailTempForm]);

  // Observers
  useEffect(() => {
    if (selectedProductId !== currentDetail.product_id) {
      setCurrentDetail({
        ...currentDetail,
        product_id: selectedProductId || "",
      });
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedDescription !== currentDetail.description) {
      setCurrentDetail({
        ...currentDetail,
        description: selectedDescription || "",
      });
    }
  }, [selectedDescription]);

  useEffect(() => {
    if (selectedQuantity !== currentDetail.quantity) {
      setCurrentDetail({ ...currentDetail, quantity: selectedQuantity || "" });
    }
  }, [selectedQuantity]);

  useEffect(() => {
    if (selectedUnit !== currentDetail.unit) {
      setCurrentDetail({ ...currentDetail, unit: selectedUnit || "" });
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedWeight !== currentDetail.weight) {
      setCurrentDetail({ ...currentDetail, weight: selectedWeight || "" });
    }
  }, [selectedWeight]);

  const [productSelected, setProductSelected] = useState<
    ProductResource | undefined
  >(undefined);

  // Funciones para detalles
  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.description ||
      !currentDetail.quantity ||
      !currentDetail.unit ||
      !currentDetail.weight
    ) {
      return;
    }

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: productSelected?.name,
    };

    if (editingDetailIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = newDetail;
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
      setEditingDetailIndex(null);
    } else {
      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }

    setCurrentDetail({
      product_id: "",
      description: "",
      quantity: "",
      unit: "NIU",
      weight: "",
    });
  };

  const handleEditDetail = (index: number) => {
    setCurrentDetail(details[index]);
    setEditingDetailIndex(index);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      details,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        <GroupFormSection
          icon={Info}
          title="Información General"
          cols={{
            md: 3,
          }}
        >
          <FormSelect
            control={form.control}
            name="transport_modality"
            label="Modalidad de Transporte"
            placeholder="Seleccione"
            options={TRANSPORT_MODALITY_OPTIONS}
          />

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
          />

          <DatePickerFormField
            control={form.control}
            name="transfer_start_date"
            label="Fecha de Inicio de Traslado"
          />

          <FormSelectAsync
            control={form.control}
            name="remittent_id"
            label="Remitente"
            placeholder="Seleccione"
            useQueryHook={useRemittents}
            mapOptionFn={(person: PersonResource) => ({
              value: person.id.toString(),
              label:
                person.business_name ??
                `${person.names} ${person.father_surname} ${person.mother_surname}`,
            })}
          />

          {/* recipient_id se envía automáticamente con valor 777 */}
          <FormField
            control={form.control}
            name="recipient_id"
            render={({ field }) => (
              <input type="hidden" {...field} value="777" />
            )}
          />
        </GroupFormSection>

        {/* Información del Transportista */}
        <GroupFormSection
          title="Información del Transportista"
          icon={BadgeInfo}
          cols={{
            md: 3,
          }}
        >
          <FormSelectAsync
            control={form.control}
            name="carrier_id"
            label="Transportista"
            placeholder="Seleccione"
            useQueryHook={useCarriers}
            mapOptionFn={(person: PersonResource) => ({
              value: person.id.toString(),
              label:
                person.business_name ||
                `${person.names} ${person.father_surname} ${person.mother_surname}`,
            })}
          />

          <FormSelectAsync
            control={form.control}
            name="driver_id"
            label="Conductor"
            placeholder="Seleccione"
            useQueryHook={useDrivers}
            mapOptionFn={(person: PersonResource) => ({
              value: person.id.toString(),
              label:
                person.business_name ??
                `${person.names} ${person.father_surname} ${person.mother_surname}`,
            })}
          />

          <FormField
            control={form.control}
            name="driver_license"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Licencia del Conductor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="D12345678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelectAsync
            control={form.control}
            name="vehicle_id"
            label="Vehículo"
            placeholder="Seleccione"
            useQueryHook={useVehicles}
            mapOptionFn={(vehicle: VehicleResource) => ({
              value: vehicle.id.toString(),
              label: vehicle.plate,
            })}
          />
        </GroupFormSection>

        {/* Información de Traslado */}
        <GroupFormSection
          title="Información de Traslado"
          icon={Car}
          cols={{ md: 2 }}
        >
          <FormSelectAsync
            control={form.control}
            name="origin_ubigeo_id"
            label="Ubigeo de Origen"
            placeholder="Buscar ubigeo..."
            useQueryHook={useUbigeosFrom}
            mapOptionFn={(item: UbigeoResource) => ({
              value: item.id.toString(),
              label: item.name,
              description: item.cadena,
            })}
          />

          <FormSelectAsync
            control={form.control}
            name="destination_ubigeo_id"
            label="Ubigeo de Destino"
            placeholder="Buscar ubigeo..."
            useQueryHook={useUbigeosTo}
            mapOptionFn={(item: UbigeoResource) => ({
              value: item.id.toString(),
              label: item.name,
              description: item.cadena,
            })}
          />

          <FormField
            control={form.control}
            name="origin_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Origen</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese la dirección de origen"
                    {...field}
                    value={field.value || ""}
                    maxLength={500}
                  />
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
                  <Input
                    placeholder="Ingrese la dirección de destino"
                    {...field}
                    value={field.value || ""}
                    maxLength={500}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Opcional" rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Detalles de Productos */}
        {mode === "create" && (
          <GroupFormSection
            title="Productos a Transportar"
            icon={Box}
            cols={{
              md: 5,
            }}
          >
            <div className="md:col-span-2">
              <Form {...detailTempForm}>
                <FormSelectAsync
                  control={detailTempForm.control}
                  name="temp_product_id"
                  label="Producto"
                  placeholder="Seleccione"
                  useQueryHook={useProduct}
                  mapOptionFn={(product: ProductResource) => ({
                    value: product.id.toString(),
                    label: product.name,
                    description: product.category_name,
                  })}
                  onValueChange={(_value, item) => {
                    setProductSelected(item);
                    // Auto-llenar descripción
                    detailTempForm.setValue(
                      "temp_description",
                      item?.name || "",
                    );
                  }}
                />
              </Form>
            </div>

            <FormField
              control={detailTempForm.control}
              name="temp_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción del producto" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={detailTempForm.control}
              name="temp_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <div className="w-1/2">
                <FormSelect
                  control={detailTempForm.control}
                  name="temp_unit"
                  label="Unidad"
                  placeholder="Seleccione"
                  options={UNIT_OPTIONS}
                />
              </div>

              <div className="w-1/2">
                <FormField
                  control={detailTempForm.control}
                  name="temp_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.0"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="col-span-full flex justify-end">
              <Button
                type="button"
                variant="default"
                onClick={handleAddDetail}
                disabled={
                  !currentDetail.product_id ||
                  !currentDetail.description ||
                  !currentDetail.quantity ||
                  !currentDetail.unit ||
                  !currentDetail.weight
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingDetailIndex !== null ? "Actualizar" : "Agregar"}
              </Button>
            </div>

            <div className="col-span-full">
              {details.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead className="text-right">Peso (kg)</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.product_name}</TableCell>
                          <TableCell>{detail.description}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {detail.quantity}
                          </TableCell>
                          <TableCell>{detail.unit}</TableCell>
                          <TableCell className="text-right">
                            {detail.weight}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDetail(index)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDetail(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Badge variant="outline" className="text-lg p-3">
                    No hay productos agregados
                  </Badge>
                </div>
              )}
            </div>
          </GroupFormSection>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !form.formState.isValid ||
              (mode === "create" && details.length === 0)
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
