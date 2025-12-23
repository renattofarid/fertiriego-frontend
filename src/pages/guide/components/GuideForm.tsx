"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader, Plus, Trash2, Pencil, Truck, MapPin } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { guideSchema, type GuideSchema } from "../lib/guide.schema";
import { searchUbigeos } from "../lib/ubigeo.actions";
import type { UbigeoResource } from "../lib/ubigeo.interface";
import { type GuideMotiveResource } from "../lib/guide.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { VehicleResource } from "@/pages/vehicle/lib/vehicle.interface";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import type { PurchaseResource } from "@/pages/purchase/lib/purchase.interface";
import type { WarehouseDocumentResource } from "@/pages/warehouse-document/lib/warehouse-document.interface";
import { format } from "date-fns";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SelectSearchForm } from "@/components/SelectSearchForm";

interface GuideFormProps {
  defaultValues: Partial<GuideSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  warehouses: WarehouseResource[];
  products: ProductResource[];
  motives: GuideMotiveResource[];
  vehicles: VehicleResource[];
  carriers: PersonResource[];
  drivers: PersonResource[];
  sales: SaleResource[];
  purchases: PurchaseResource[];
  warehouseDocuments: WarehouseDocumentResource[];
  recipients: PersonResource[];
}

interface DetailRow {
  product_id: number;
  product_name?: string;
  description: string;
  quantity: string;
  unit_measure: string;
  weight: string;
}

const MODALITIES = [
  { value: "PUBLICO", label: "Transporte Público" },
  { value: "PRIVADO", label: "Transporte Privado" },
];

const UNIT_MEASUREMENTS = [
  { value: "KGM", label: "Kilogramos (KGM)" },
  { value: "TNE", label: "Toneladas (TNE)" },
  { value: "GRM", label: "Gramos (GRM)" },
  { value: "UND", label: "Unidades (UND)" },
];

export const GuideForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  warehouses,
  products,
  motives,
  vehicles,
  carriers,
  drivers,
  sales,
  purchases,
  warehouseDocuments,
  recipients,
}: GuideFormProps) => {
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: 0,
    description: "",
    quantity: "",
    unit_measure: "UND",
    weight: "",
  });

  // Estado local para ubigeos de origen
  const [originUbigeos, setOriginUbigeos] = useState<UbigeoResource[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);

  // Estado local para ubigeos de destino
  const [destinationUbigeos, setDestinationUbigeos] = useState<
    UbigeoResource[]
  >([]);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);

  const formatUbigeoLabel = (ubigeo: UbigeoResource): string => {
    const parts = ubigeo.cadena.split("-");
    if (parts.length >= 4) {
      return `${parts[1]} > ${parts[2]} > ${parts[3]}`;
    }
    return ubigeo.cadena;
  };

  const handleSearchOriginUbigeos = useCallback(async (cadena?: string) => {
    setIsSearchingOrigin(true);
    try {
      const response = await searchUbigeos(cadena, 15);
      setOriginUbigeos(response.data);
    } catch (error) {
      console.error("Error searching origin ubigeos:", error);
      setOriginUbigeos([]);
    } finally {
      setIsSearchingOrigin(false);
    }
  }, []);

  const handleSearchDestinationUbigeos = useCallback(
    async (cadena?: string) => {
      setIsSearchingDestination(true);
      try {
        const response = await searchUbigeos(cadena, 15);
        setDestinationUbigeos(response.data);
      } catch (error) {
        console.error("Error searching destination ubigeos:", error);
        setDestinationUbigeos([]);
      } finally {
        setIsSearchingDestination(false);
      }
    },
    []
  );

  const form = useForm({
    resolver: zodResolver(guideSchema) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Establecer fechas automáticamente
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    if (!form.getValues("issue_date")) {
      form.setValue("issue_date", formattedDate);
    }
    if (!form.getValues("transfer_date")) {
      form.setValue("transfer_date", formattedDate);
    }
  }, [form]);

  // Cargar detalles existentes en modo edición
  useEffect(() => {
    if (mode === "update" && defaultValues.details) {
      const formattedDetails = defaultValues.details.map((detail: any) => ({
        product_id: detail.product_id || 0,
        product_name: detail.description || "",
        description: detail.description || "",
        quantity: detail.quantity?.toString() || "",
        unit_measure: detail.unit_measure || "UND",
        weight: detail.weight?.toString() || "",
      }));
      setDetails(formattedDetails);
    }
  }, []);

  const handleAddDetail = () => {
    if (!currentDetail.product_id || !currentDetail.quantity) {
      alert("Seleccione producto y cantidad");
      return;
    }

    const detailToSave: DetailRow = {
      ...currentDetail,
      description:
        currentDetail.description ||
        products.find((p) => p.id === currentDetail.product_id)?.name ||
        "",
    };

    if (editingDetailIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = detailToSave;
      setDetails(updatedDetails);
      setEditingDetailIndex(null);
    } else {
      setDetails([...details, detailToSave]);
    }

    setCurrentDetail({
      product_id: 0,
      description: "",
      quantity: "",
      unit_measure: "UND",
      weight: "",
    });
  };

  const handleEditDetail = (index: number) => {
    setCurrentDetail(details[index]);
    setEditingDetailIndex(index);
  };

  const handleDeleteDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const formatted = details.map((detail) => ({
      product_id: detail.product_id.toString(),
      description:
        detail.description ||
        products.find((p) => p.id === detail.product_id)?.name ||
        "",
      quantity: Number(detail.quantity),
      unit_measure: detail.unit_measure,
      weight: Number(detail.weight || 0),
    }));
    form.setValue("details", formatted as any, { shouldValidate: true });
  }, [details, form, products]);

  const handleFormSubmit = (data: any) => {
    const hasCurrentDetail =
      currentDetail.product_id && currentDetail.quantity?.trim() !== "";
    const effectiveDetails =
      details.length > 0 ? details : hasCurrentDetail ? [currentDetail] : [];

    if (effectiveDetails.length === 0) {
      alert("Debe agregar al menos un detalle");
      return;
    }

    const formattedDetails = effectiveDetails.map((detail) => ({
      product_id: Number(detail.product_id),
      description: detail.description,
      quantity: Number(detail.quantity),
      unit_measure: detail.unit_measure,
      weight: Number(detail.weight || 0),
    }));

    const payload: GuideSchema = {
      ...data,
      details: formattedDetails,
    };

    console.log("✅ Payload siendo enviado:", payload);
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="warehouse_id"
            label="Almacén"
            placeholder="Seleccione un almacén"
            options={warehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.name,
              description: warehouse.address,
            }))}
          />

          <FormSelect
            control={form.control}
            name="motive_id"
            label="Motivo de Traslado"
            placeholder="Seleccione un motivo"
            options={motives.map((motive) => ({
              value: motive.id.toString(),
              label: motive.name,
              description: motive.code,
            }))}
            withValue
          />

          <FormSelect
            control={form.control}
            name="transport_modality"
            label="Modalidad de Transporte"
            placeholder="Seleccione modalidad"
            options={MODALITIES.map((mod) => ({
              value: mod.value,
              label: mod.label,
            }))}
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

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Información Opcional */}
        <GroupFormSection
          title="Información Opcional"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="sale_id"
            label="Venta"
            placeholder="Selecciona una venta"
            options={sales.map((sale) => ({
              value: sale.id.toString(),
              label: sale.full_document_number || `Venta #${sale.id}`,
              description: sale.customer.full_name,
            }))}
            withValue
          />

          <FormSelect
            control={form.control}
            name="purchase_id"
            label="Compra"
            placeholder="Selecciona una compra"
            options={purchases.map((purchase) => ({
              value: purchase.id.toString(),
              label: purchase.document_number || `Compra #${purchase.id}`,
              description: purchase.supplier_fullname,
            }))}
            withValue
          />

          <FormSelect
            control={form.control}
            name="warehouse_document_id"
            label="Documento Almacén"
            placeholder="Selecciona un documento"
            options={warehouseDocuments.map((doc) => ({
              value: doc.id.toString(),
              label: `${doc.document_type} - ${doc.document_number}`,
              description: doc.warehouse_name,
            }))}
            withValue
          />

          <FormSelect
            control={form.control}
            name="destination_warehouse_id"
            label="Almacén Destino"
            placeholder="Selecciona un almacén"
            options={warehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.name,
              description: warehouse.address,
            }))}
          />

          <FormSelect
            control={form.control}
            name="recipient_id"
            label="Receptor"
            placeholder="Selecciona un receptor"
            options={recipients.map((recipient) => ({
              value: recipient.id.toString(),
              label:
                recipient.business_name ||
                `${recipient.names} ${recipient.father_surname} ${recipient.mother_surname}`.trim(),
              description: recipient.business_name
                ? ""
                : `${recipient.names} ${recipient.father_surname} ${recipient.mother_surname}`.trim(),
            }))}
            withValue
          />
        </GroupFormSection>

        {/* Información de Transporte */}
        <GroupFormSection
          title="Información de Transporte"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="carrier_id"
            label="Transportista"
            placeholder="Seleccione un transportista"
            options={carriers.map((carrier) => ({
              value: carrier.id.toString(),
              label:
                carrier.business_name ||
                `${carrier.names} ${carrier.father_surname} ${carrier.mother_surname}`.trim(),
            }))}
          />

          <FormSelect
            control={form.control}
            name="driver_id"
            label="Conductor"
            placeholder="Seleccione un conductor"
            options={drivers.map((driver) => ({
              value: driver.id.toString(),
              label:
                driver.business_name ||
                `${driver.names} ${driver.father_surname} ${driver.mother_surname}`.trim(),
            }))}
          />

          <FormSelect
            control={form.control}
            name="vehicle_id"
            label="Vehículo"
            placeholder="Seleccione un vehículo"
            options={vehicles.map((vehicle) => ({
              value: vehicle.id.toString(),
              label: vehicle.plate,
              description: `${vehicle.brand} ${vehicle.model}`,
            }))}
          />

          <FormField
            control={form.control}
            name="driver_license"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Licencia del Conductor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: B12345678"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Información de Origen */}
        <GroupFormSection
          title="Información de Origen"
          icon={MapPin}
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="origin_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Origen</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dirección de origen"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectSearchForm
            control={form.control}
            name="origin_ubigeo_id"
            label="Ubigeo de Origen"
            placeholder="Buscar ubigeo..."
            isSearching={isSearchingOrigin}
            items={originUbigeos}
            onSearch={handleSearchOriginUbigeos}
            formatLabel={formatUbigeoLabel}
            getItemId={(ubigeo) => ubigeo.id}
          />
        </GroupFormSection>

        {/* Información de Destino */}
        <GroupFormSection
          title="Información de Destino"
          icon={MapPin}
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="destination_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Destino</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dirección de destino"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectSearchForm
            control={form.control}
            name="destination_ubigeo_id"
            label="Ubigeo de Destino"
            placeholder="Buscar ubigeo..."
            isSearching={isSearchingDestination}
            items={destinationUbigeos}
            onSearch={handleSearchDestinationUbigeos}
            formatLabel={formatUbigeoLabel}
            getItemId={(ubigeo) => ubigeo.id}
          />
        </GroupFormSection>

        {/* Detalles de Productos */}
        <GroupFormSection
          title="Detalles de Productos"
          icon={Truck}
          cols={{ sm: 1, md: 3 }}
        >
          <FormField
            control={form.control}
            name="details"
            render={() => (
              <FormItem className="col-span-full">
                <div className="space-y-4">
                  {/* Formulario para agregar detalles */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-6 p-4 rounded-lg">
                    <SearchableSelect
                      label="Producto"
                      options={products.map((product) => ({
                        value: product.id.toString(),
                        label: product.name,
                        description: product.brand_name,
                      }))}
                      withValue
                      value={currentDetail.product_id.toString()}
                      onChange={(value) => {
                        const productId = Number(value);
                        const selected = products.find(
                          (p) => p.id === productId
                        );
                        setCurrentDetail({
                          ...currentDetail,
                          product_id: productId,
                          description: selected?.name || "",
                        });
                      }}
                      placeholder="Selecciona un producto"
                      classNameDiv="md:col-span-2"
                      buttonSize="default"
                      className="md:w-full"
                    />

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Cantidad
                      </label>
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={currentDetail.quantity}
                        onChange={(e) =>
                          setCurrentDetail({
                            ...currentDetail,
                            quantity: e.target.value,
                          })
                        }
                      />
                    </div>

                    <SearchableSelect
                      label="Unidad"
                      options={UNIT_MEASUREMENTS.map((unit) => ({
                        value: unit.value,
                        label: unit.label,
                      }))}
                      value={currentDetail.unit_measure}
                      onChange={(value) =>
                        setCurrentDetail({
                          ...currentDetail,
                          unit_measure: value,
                        })
                      }
                      buttonSize="default"
                      placeholder="Selecciona unidad"
                    />

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Peso
                      </label>
                      <Input
                        type="number"
                        placeholder="Peso"
                        value={currentDetail.weight}
                        onChange={(e) =>
                          setCurrentDetail({
                            ...currentDetail,
                            weight: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddDetail}
                        size="sm"
                        className="w-full"
                      >
                        {editingDetailIndex !== null ? (
                          <>
                            <Pencil className="mr-2 h-4 w-4" />
                            Actualizar
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Tabla de detalles */}
                  {details.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-100">
                          <TableRow>
                            <TableHead className="text-xs">Producto</TableHead>
                            <TableHead className="text-xs text-center">
                              Cantidad
                            </TableHead>
                            <TableHead className="text-xs text-center">
                              Unidad
                            </TableHead>
                            <TableHead className="text-xs text-center">
                              Peso
                            </TableHead>
                            <TableHead className="text-xs text-center w-20">
                              Acciones
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {details.map((detail, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-xs">
                                {products.find(
                                  (p) => p.id === detail.product_id
                                )?.name || "N/A"}
                              </TableCell>
                              <TableCell className="text-xs text-center">
                                {detail.quantity}
                              </TableCell>
                              <TableCell className="text-xs text-center">
                                {detail.unit_measure}
                              </TableCell>
                              <TableCell className="text-xs text-center">
                                {detail.weight}
                              </TableCell>
                              <TableCell className="text-xs text-center space-x-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditDetail(index)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDetail(index)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Guía" : "Actualizar Guía"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
