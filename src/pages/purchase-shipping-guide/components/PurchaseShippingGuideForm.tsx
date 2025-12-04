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
import { Loader, Plus, Trash2, Edit, Search } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PurchaseResource } from "@/pages/purchase/lib/purchase.interface";
import { useState, useEffect } from "react";
import { searchRUC, isValidData } from "@/lib/document-search.service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GUIDE_STATUS_OPTIONS, UNIT_OPTIONS } from "../lib/purchase-shipping-guide.interface";

interface PurchaseShippingGuideFormProps {
  defaultValues: Partial<PurchaseShippingGuideSchema>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  products: ProductResource[];
  purchases?: PurchaseResource[];
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
  products,
  purchases = [],
}: PurchaseShippingGuideFormProps) => {
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    quantity: "",
    unit: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [fieldsFromSearch, setFieldsFromSearch] = useState({
    carrier_name: false,
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseShippingGuideSchemaCreate : purchaseShippingGuideSchemaUpdate
    ),
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
  const selectedPurchaseId = form.watch("purchase_id");

  // Auto-llenar datos cuando se selecciona una compra
  useEffect(() => {
    if (!selectedPurchaseId || selectedPurchaseId === "" || mode !== "create") {
      return;
    }

    const selectedPurchase = purchases.find(
      (p) => p.id.toString() === selectedPurchaseId
    );

    if (!selectedPurchase) return;

    // Auto-llenar datos del proveedor en dirección de origen
    if (selectedPurchase.supplier_fullname) {
      form.setValue(
        "origin_address",
        `Proveedor: ${selectedPurchase.supplier_fullname}`
      );
    }

    // Auto-llenar detalles de productos de la compra
    if (selectedPurchase.details && selectedPurchase.details.length > 0) {
      const purchaseDetails: DetailRow[] = selectedPurchase.details.map(
        (detail) => {
          return {
            product_id: detail.product_id.toString(),
            product_name: detail.product_name,
            quantity: detail.quantity,
            unit: "UND", // Unidad por defecto
          };
        }
      );

      setDetails(purchaseDetails);
      form.setValue("details", purchaseDetails);
    }
  }, [selectedPurchaseId, purchases, form, mode]);

  // Sincronizar detalles
  useEffect(() => {
    detailTempForm.setValue("temp_product_id", currentDetail.product_id);
    detailTempForm.setValue("temp_quantity", currentDetail.quantity);
    detailTempForm.setValue("temp_unit", currentDetail.unit);
  }, [currentDetail, detailTempForm]);

  // Observers
  useEffect(() => {
    if (selectedProductId !== currentDetail.product_id) {
      setCurrentDetail({ ...currentDetail, product_id: selectedProductId || "" });
    }
  }, [selectedProductId]);

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

  // Funciones para detalles
  const handleAddDetail = () => {
    if (!currentDetail.product_id || !currentDetail.quantity || !currentDetail.unit) {
      return;
    }

    const product = products.find((p) => p.id.toString() === currentDetail.product_id);

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: product?.name,
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
      unit: "",
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
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="guide_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Guía</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="T001-00000001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mode === "create" && purchases && purchases.length > 0 && (
                <FormSelect
                  control={form.control}
                  name="purchase_id"
                  label="Compra (Opcional)"
                  placeholder="Seleccione una compra"
                  options={[
                    { value: "", label: "Sin compra" },
                    ...purchases.map((purchase) => ({
                      value: purchase.id.toString(),
                      label: `${purchase.correlativo} - ${purchase.supplier_fullname}`,
                    })),
                  ]}
                />
              )}

              <FormSelect
                control={form.control}
                name="status"
                label="Estado"
                placeholder="Seleccione"
                options={GUIDE_STATUS_OPTIONS}
              />
            </div>

            <FormField
              control={form.control}
              name="motive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de Traslado</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Compra de materiales" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Información del Transportista */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Transportista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="carrier_ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC del Transportista</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="20123456789" maxLength={11} />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={
                            !field.value || field.value.length !== 11 || isSearching
                          }
                          onClick={async () => {
                            if (field.value && field.value.length === 11) {
                              setIsSearching(true);
                              try {
                                const response = await searchRUC({
                                  search: field.value,
                                });
                                if (response.data) {
                                  const newFieldsFromSearch = {
                                    ...fieldsFromSearch,
                                  };
                                  if (isValidData(response.data.business_name)) {
                                    form.setValue(
                                      "carrier_name",
                                      response.data.business_name
                                    );
                                    newFieldsFromSearch.carrier_name = true;
                                  }
                                  setFieldsFromSearch(newFieldsFromSearch);
                                }
                              } catch (error) {
                                console.error("Error searching RUC:", error);
                              } finally {
                                setIsSearching(false);
                              }
                            }
                          }}
                        >
                          {isSearching ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carrier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Transportista</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nombre o Razón Social"
                        disabled={fieldsFromSearch.carrier_name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa del Vehículo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ABC-123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="driver_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Conductor</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre completo" />
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
                      <Input {...field} placeholder="D12345678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Traslado */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Traslado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Origen</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Dirección completa" rows={2} />
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
                      <Textarea {...field} placeholder="Dirección completa" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Total (kg)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Opcional" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Detalles de Productos */}
        {mode === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Productos a Transportar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sidebar rounded-lg">
                <div className="md:col-span-2">
                  <Form {...detailTempForm}>
                    <FormSelect
                      control={detailTempForm.control}
                      name="temp_product_id"
                      label="Producto"
                      placeholder="Seleccione"
                      options={products.map((product) => ({
                        value: product.id.toString(),
                        label: product.name,
                      }))}
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
              </div>

              <div className="flex justify-end">
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
                                <Edit className="h-4 w-4" />
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
            </CardContent>
          </Card>
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
