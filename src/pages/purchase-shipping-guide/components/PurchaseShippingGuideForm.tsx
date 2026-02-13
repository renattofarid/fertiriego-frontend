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
  GUIDE_STATUS_OPTIONS,
} from "../lib/purchase-shipping-guide.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useCarriers } from "@/pages/carrier/lib/carrier.hook";
import { useDrivers } from "@/pages/driver/lib/driver.hook";
import { useVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { VehicleResource } from "@/pages/vehicle/lib/vehicle.interface";
import { usePurchases } from "@/pages/purchase/lib/purchase.hook";
import type {
  PurchaseResource,
  PurchaseDetailResource,
} from "@/pages/purchase/lib/purchase.interface";

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
  quantity: string;
  unit: string;
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
    quantity: "",
    unit: "NIU",
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseShippingGuideSchemaCreate
        : purchaseShippingGuideSchemaUpdate,
    ) as any,
    defaultValues,
    mode: "onChange",
  });

  const detailTempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_quantity: currentDetail.quantity,
      temp_unit: currentDetail.unit,
    },
  });

  // Watchers
  const selectedProductId = detailTempForm.watch("temp_product_id");
  const selectedQuantity = detailTempForm.watch("temp_quantity");
  const selectedUnit = detailTempForm.watch("temp_unit");

  // Sincronizar detalles
  useEffect(() => {
    detailTempForm.setValue("temp_product_id", currentDetail.product_id);
    detailTempForm.setValue("temp_quantity", currentDetail.quantity);
    detailTempForm.setValue("temp_unit", currentDetail.unit);
  }, [currentDetail, detailTempForm]);

  // Observers
  useEffect(() => {
    setCurrentDetail((prev) => {
      if (selectedProductId !== prev.product_id) {
        return {
          ...prev,
          product_id: selectedProductId || "",
        };
      }
      return prev;
    });
  }, [selectedProductId]);

  useEffect(() => {
    setCurrentDetail((prev) => {
      if (selectedQuantity !== prev.quantity) {
        return { ...prev, quantity: selectedQuantity || "" };
      }
      return prev;
    });
  }, [selectedQuantity]);

  useEffect(() => {
    setCurrentDetail((prev) => {
      if (selectedUnit !== prev.unit) {
        return { ...prev, unit: selectedUnit || "" };
      }
      return prev;
    });
  }, [selectedUnit]);

  const [productSelected, setProductSelected] = useState<
    ProductResource | undefined
  >(undefined);

  // Funciones para detalles
  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      !currentDetail.unit
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
      quantity: "",
      unit: "NIU",
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
          <FormSelectAsync
            control={form.control as any}
            name="purchase_id"
            label="Compra (Opcional)"
            placeholder="Buscar compra..."
            useQueryHook={usePurchases}
            mapOptionFn={(purchase: PurchaseResource) => ({
              value: purchase.id.toString(),
              label: purchase.correlativo,
              description: purchase.supplier_fullname,
            })}
            onValueChange={(_value, item) => {
              if (item && item.details) {
                // Cargar los productos de la compra seleccionada
                const purchaseDetails = item.details.map(
                  (detail: PurchaseDetailResource) => ({
                    product_id: detail.product_id.toString(),
                    product_name: detail.product_name,
                    quantity: detail.quantity,
                    unit: "NIU",
                  }),
                );
                setDetails(purchaseDetails);
                form.setValue("details", purchaseDetails);
              }
            }}
          />

          <FormField
            control={form.control as any}
            name="guide_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Guía</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="T001-00000001"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DatePickerFormField
            control={form.control as any}
            name="issue_date"
            label="Fecha de Emisión"
          />

          <DatePickerFormField
            control={form.control as any}
            name="transfer_date"
            label="Fecha de Traslado"
          />

          <FormField
            control={form.control as any}
            name="motive"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Motivo</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Ej: Compra de materiales"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control as any}
            name="status"
            label="Estado"
            placeholder="Seleccione"
            options={GUIDE_STATUS_OPTIONS}
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
            control={form.control as any}
            name="carrier_id"
            label="Seleccionar Transportista"
            placeholder="Buscar transportista..."
            useQueryHook={useCarriers}
            mapOptionFn={(carrier: PersonResource) => ({
              value: carrier.id.toString(),
              label: carrier.business_name || carrier.names,
              description: carrier.number_document,
            })}
            onValueChange={(_value, item) => {
              if (item) {
                form.setValue("carrier_name", item.business_name || item.names);
                form.setValue("carrier_ruc", item.number_document);
              }
            }}
          />

          <FormField
            control={form.control as any}
            name="carrier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Transportista</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Ej: Transporte Los Andes S.A.C."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="carrier_ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC del Transportista</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="20123456789"
                    maxLength={11}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelectAsync
            control={form.control as any}
            name="driver_id"
            label="Seleccionar Conductor"
            placeholder="Buscar conductor..."
            useQueryHook={useDrivers}
            mapOptionFn={(driver: PersonResource) => ({
              value: driver.id.toString(),
              label:
                driver.business_name ??
                `${driver.names} ${driver.father_surname} ${driver.mother_surname}`,
              description: driver.number_document,
            })}
            onValueChange={(_value, item) => {
              if (item) {
                form.setValue(
                  "driver_name",
                  item.business_name ||
                    `${item.names} ${item.father_surname} ${item.mother_surname}`,
                );
              }
            }}
          />

          <FormField
            control={form.control as any}
            name="driver_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Conductor</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Ej: Carlos Pérez"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="driver_license"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Licencia del Conductor</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="D12345678"
                    maxLength={20}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelectAsync
            control={form.control as any}
            name="vehicle_id"
            label="Seleccionar Vehículo"
            placeholder="Buscar vehículo..."
            useQueryHook={useVehicles}
            mapOptionFn={(vehicle: VehicleResource) => ({
              value: vehicle.id.toString(),
              label: vehicle.plate,
              description: `${vehicle.brand} ${vehicle.model}`,
            })}
            onValueChange={(_value, item) => {
              if (item) {
                form.setValue("vehicle_plate", item.plate);
              }
            }}
          />

          <FormField
            control={form.control as any}
            name="vehicle_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa del Vehículo</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="ABC-123"
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Información de Traslado */}
        <GroupFormSection
          title="Información de Traslado"
          icon={Car}
          cols={{ md: 2 }}
        >
          <FormField
            control={form.control as any}
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
            control={form.control as any}
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
            control={form.control as any}
            name="total_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Total (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="observations"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Opcional"
                    rows={2}
                  />
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
                  }}
                />
              </Form>
            </div>

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

            <FormSelect
              control={detailTempForm.control}
              name="temp_unit"
              label="Unidad"
              placeholder="Seleccione"
              options={UNIT_OPTIONS}
            />

            <div className="col-span-full flex justify-end">
              <Button
                type="button"
                variant="default"
                onClick={handleAddDetail}
                disabled={
                  !currentDetail.product_id ||
                  !currentDetail.quantity ||
                  !currentDetail.unit
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
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.product_name}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {detail.quantity}
                          </TableCell>
                          <TableCell>{detail.unit}</TableCell>
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

        <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
        </pre>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting || (mode === "create" && details.length === 0)
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
