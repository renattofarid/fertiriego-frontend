"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { FormInput } from "@/components/FormInput";

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
      temp_product_id: "",
      temp_quantity: "",
      temp_unit: "NIU",
    },
  });

  // Sincronizar solo cuando se edita un detalle (una sola vez)
  useEffect(() => {
    if (editingDetailIndex !== null) {
      detailTempForm.setValue("temp_product_id", currentDetail.product_id);
      detailTempForm.setValue("temp_quantity", currentDetail.quantity);
      detailTempForm.setValue("temp_unit", currentDetail.unit);
    }
  }, [editingDetailIndex]);

  const [productSelected, setProductSelected] = useState<
    ProductResource | undefined
  >(undefined);

  // Funciones para detalles
  const handleAddDetail = () => {
    const productId = detailTempForm.getValues("temp_product_id");
    const quantity = detailTempForm.getValues("temp_quantity");
    const unit = detailTempForm.getValues("temp_unit");

    if (!productId || !quantity || !unit) {
      return;
    }

    const newDetail: DetailRow = {
      product_id: productId,
      quantity: quantity,
      unit: unit,
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

    // Resetear el formulario temporal
    detailTempForm.reset({
      temp_product_id: "",
      temp_quantity: "",
      temp_unit: "NIU",
    });
    setProductSelected(undefined);
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

                // Calcular y setear el peso total sumando todas las cantidades
                const totalWeight = item.details.reduce(
                  (sum: number, detail: PurchaseDetailResource) => {
                    return sum + parseFloat(detail.quantity || "0");
                  },
                  0,
                );
                form.setValue("total_weight", totalWeight.toString());
              }
            }}
          />

          <FormInput
            control={form.control}
            name="guide_number"
            label="Número de Guía"
            placeholder="T001-00000001"
            uppercase
          />

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
          />

          <DatePickerFormField
            control={form.control}
            name="transfer_date"
            label="Fecha de Traslado"
          />

          <FormInput
            control={form.control}
            name="motive"
            label="Motivo"
            placeholder="Ej: Compra de materiales"
            uppercase
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
            label="Transportista"
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

          <FormInput
            control={form.control}
            name="carrier_name"
            label="Nombre del Transportista"
            placeholder="Se llenará automáticamente"
            disabled
            uppercase
          />

          <FormInput
            control={form.control}
            name="carrier_ruc"
            label="RUC del Transportista"
            placeholder="Se llenará automáticamente"
            disabled
          />

          <FormSelectAsync
            control={form.control as any}
            name="driver_id"
            label="Conductor"
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

          <FormInput
            control={form.control}
            name="driver_name"
            label="Nombre del Conductor"
            placeholder="Se llenará automáticamente"
            disabled
            uppercase
          />

          <FormInput
            control={form.control}
            name="driver_license"
            label="Licencia del Conductor"
            // placeholder="Ej: D12345678 (Opcional)"
            placeholder="Ej: D12345678"
            uppercase
          />

          <FormSelectAsync
            control={form.control as any}
            name="vehicle_id"
            label="Vehículo"
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

          <FormInput
            control={form.control}
            name="vehicle_plate"
            label="Placa del Vehículo"
            placeholder="Se llenará automáticamente"
            disabled
            uppercase
          />
        </GroupFormSection>

        {/* Información de Traslado */}
        <GroupFormSection
          title="Información de Traslado"
          icon={Car}
          cols={{ md: 2 }}
        >
          <FormInput
            control={form.control}
            name="origin_address"
            label="Dirección de Origen"
            placeholder="Ingrese la dirección de origen"
            uppercase
          />

          <FormInput
            control={form.control}
            name="destination_address"
            label="Dirección de Destino"
            placeholder="Ingrese la dirección de destino"
            uppercase
          />

          <FormInput
            control={form.control}
            name="total_weight"
            label="Peso Total (kg)"
            placeholder="0.00"
            type="number"
            step="0.01"
          />

          <FormInput
            control={form.control}
            name="observations"
            label="Observaciones"
            placeholder="Ingrese observaciones adicionales"
            uppercase
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
                  additionalParams={{
                    per_page: 100,
                  }}
                  mapOptionFn={(product: ProductResource) => ({
                    value: product.id.toString(),
                    label: product.name,
                    description: product.category_name,
                  })}
                  onValueChange={(_value, item) => {
                    setProductSelected(item);
                  }}
                  defaultOption={
                    editingDetailIndex !== null && currentDetail.product_name
                      ? {
                          value: currentDetail.product_id.toString(),
                          label: currentDetail.product_name,
                          description: "",
                        }
                      : undefined
                  }
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
                  !detailTempForm.watch("temp_product_id") ||
                  !detailTempForm.watch("temp_quantity") ||
                  !detailTempForm.watch("temp_unit")
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
                                
                                onClick={() => handleEditDetail(index)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                
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
