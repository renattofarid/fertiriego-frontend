import { useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TitleFormComponent from "@/components/TitleFormComponent";
import FormWrapper from "@/components/FormWrapper";
import {
  SHIPPING_GUIDE_CARRIER,
  UNIT_MEASUREMENTS,
} from "../lib/shipping-guide-carrier.interface";
import { MODALITIES } from "@/pages/guide/lib/guide.interface";
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
import { Plus, Trash2, Loader, Truck, MapPin, Pencil } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SelectSearchForm } from "@/components/SelectSearchForm";
import { DataTable } from "@/components/DataTable";
import { searchUbigeos } from "@/pages/guide/lib/ubigeo.actions";
import type { UbigeoResource } from "@/pages/guide/lib/ubigeo.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { VehicleResource } from "@/pages/vehicle/lib/vehicle.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { GuideResource } from "@/pages/guide/lib/guide.interface";
import { findGuideById } from "@/pages/guide/lib/guide.actions";
import { toast } from "sonner";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useDrivers } from "@/pages/driver/lib/driver.hook";

export type ShippingGuideCarrierFormValues = {
  transport_modality: string;
  carrier_id?: string;
  driver_id?: string;
  vehicle_id?: string;
  vehicle_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_mtc?: string;
  driver_license?: string;
  issue_date: string;
  transfer_start_date: string;
  remittent_id: string;
  recipient_id?: string;
  secondary_vehicle_id?: string;
  order_id?: string;
  shipping_guide_remittent_id?: string;
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
  transport_modality: "PRIVADO",
  carrier_id: "",
  driver_id: "",
  vehicle_id: "",
  vehicle_plate: "",
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_mtc: "",
  driver_license: "",
  issue_date: "",
  transfer_start_date: "",
  remittent_id: "",
  recipient_id: "",
  secondary_vehicle_id: "",
  order_id: "",
  shipping_guide_remittent_id: "",
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
  mode?: "create" | "edit";
  onSubmit: (values: ShippingGuideCarrierFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: ShippingGuideCarrierFormValues;
  carriers: PersonResource[];
  remittents: PersonResource[];
  recipients: PersonResource[];
  vehicles: VehicleResource[];
  guides: GuideResource[];
}

export function ShippingGuideCarrierForm({
  mode = "create",
  onSubmit,
  isSubmitting = false,
  initialValues,
  carriers,
  remittents,
  recipients,
  vehicles,
  guides,
}: ShippingGuideCarrierFormProps) {
  const { ROUTE, MODEL, ICON } = SHIPPING_GUIDE_CARRIER;
  const navigate = useNavigate();

  // Estado para detalles
  type DetailRow = {
    product_id: string;
    product_name: string;
    brand_name?: string;
    description: string;
    quantity: number;
    unit: string;
    weight: number;
  };

  const [details, setDetails] = useState<DetailRow[]>([]);
  const [currentDetail, setCurrentDetail] = useState<Partial<DetailRow>>({
    product_id: "",
    quantity: 0,
    unit: UNIT_MEASUREMENTS[0].value,
    weight: 0,
  });
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );

  // Estado para ubigeos
  const [originUbigeos, setOriginUbigeos] = useState<UbigeoResource[]>([]);
  const [destinationUbigeos, setDestinationUbigeos] = useState<
    UbigeoResource[]
  >([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);

  const form = useForm<ShippingGuideCarrierFormValues>({
    resolver: zodResolver(
      shippingGuideCarrierSchema,
    ) as Resolver<ShippingGuideCarrierFormValues>,
    defaultValues: initialValues ?? {
      ...defaultValues,
      details: [],
    },
  });

  const transportModality = form.watch("transport_modality");
  const selectedGuideId = form.watch("shipping_guide_remittent_id");

  const [selectedProduct, setSelectedProduct] = useState<
    ProductResource | undefined
  >(undefined);

  // Cargar detalles iniciales cuando hay initialValues
  useEffect(() => {
    if (initialValues?.details && initialValues.details.length > 0) {
      const mappedDetails: DetailRow[] = initialValues.details.map((d) => ({
        product_id: d.product_id,
        product_name: d.description || "Producto desconocido",
        description: d.description,
        quantity: parseFloat(d.quantity) || 0,
        unit: d.unit,
        weight: parseFloat(d.weight) || 0,
      }));
      setDetails(mappedDetails);
    }
  }, [initialValues]);

  // Cargar detalles cuando se selecciona una guía de remisión
  useEffect(() => {
    const loadGuideDetails = async () => {
      if (!selectedGuideId || selectedGuideId === "") {
        return;
      }

      try {
        const response = await findGuideById(parseInt(selectedGuideId));
        const guide = response.data;

        if (guide.details && guide.details.length > 0) {
          const mappedDetails: DetailRow[] = guide.details.map((detail) => ({
            product_id: detail.product_id.toString(),
            product_name: detail.product_name || "Producto desconocido",
            description: detail.description || "",
            quantity: parseFloat(detail.quantity) || 0,
            unit: detail.unit_measure || UNIT_MEASUREMENTS[0].value,
            weight: parseFloat(detail.weight) || 0,
          }));
          setDetails(mappedDetails);
          toast.success(
            `Se cargaron ${mappedDetails.length} detalles de la guía ${guide.full_guide_number}`,
          );
        } else {
          toast.info("La guía seleccionada no tiene detalles");
        }
      } catch (error) {
        console.error("Error loading guide details:", error);
        toast.error("Error al cargar los detalles de la guía");
      }
    };

    loadGuideDetails();
  }, [selectedGuideId]);

  // Buscar ubigeos origen
  const handleSearchOriginUbigeos = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) {
      setOriginUbigeos([]);
      return;
    }
    setIsSearchingOrigin(true);
    try {
      const response = await searchUbigeos(searchTerm);
      setOriginUbigeos(response.data);
    } catch (error) {
      console.error("Error searching origin ubigeos:", error);
      setOriginUbigeos([]);
    } finally {
      setIsSearchingOrigin(false);
    }
  }, []);

  // Buscar ubigeos destino
  const handleSearchDestinationUbigeos = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 3) {
        setDestinationUbigeos([]);
        return;
      }
      setIsSearchingDestination(true);
      try {
        const response = await searchUbigeos(searchTerm);
        setDestinationUbigeos(response.data);
      } catch (error) {
        console.error("Error searching destination ubigeos:", error);
        setDestinationUbigeos([]);
      } finally {
        setIsSearchingDestination(false);
      }
    },
    [],
  );

  // Formatear label ubigeo
  const formatUbigeoLabel = (ubigeo: UbigeoResource): string => {
    const parts = ubigeo.cadena.split("-");
    if (parts.length >= 4) {
      return `${parts[1]} > ${parts[2]} > ${parts[3]}`;
    }
    return ubigeo.cadena;
  };

  // Agregar/Actualizar detalle
  const handleAddOrUpdateDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      !currentDetail.weight
    ) {
      toast.error("Complete todos los campos del detalle");
      return;
    }

    if (!selectedProduct) {
      toast.error("Producto no encontrado");
      return;
    }

    const newDetail: DetailRow = {
      product_id: currentDetail.product_id,
      product_name: selectedProduct.name,
      brand_name: selectedProduct.brand_name,
      description: currentDetail.description || "",
      quantity: currentDetail.quantity,
      unit: currentDetail.unit || UNIT_MEASUREMENTS[0].value,
      weight: currentDetail.weight,
    };

    if (editingDetailIndex !== null) {
      const updated = [...details];
      updated[editingDetailIndex] = newDetail;
      setDetails(updated);
      setEditingDetailIndex(null);
    } else {
      setDetails([...details, newDetail]);
    }

    setCurrentDetail({
      product_id: "",
      quantity: 0,
      unit: UNIT_MEASUREMENTS[0].value,
      weight: 0,
      description: "",
    });
    setSelectedProduct(undefined);
  };

  // Editar detalle
  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setCurrentDetail({
      product_id: detail.product_id,
      quantity: detail.quantity,
      unit: detail.unit,
      weight: detail.weight,
      description: detail.description,
    });
    setEditingDetailIndex(index);
  };

  // Eliminar detalle
  const handleDeleteDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // Sincronizar details con form
  useEffect(() => {
    const formatted = details.map((d) => ({
      product_id: d.product_id,
      description: d.description,
      quantity: d.quantity.toString(),
      unit: d.unit,
      weight: d.weight.toString(),
    }));
    form.setValue("details", formatted);
  }, [details, form]);

  // Columnas para DataTable
  const createDetailColumns = (
    onEdit: (index: number) => void,
    onDelete: (index: number) => void,
  ): ColumnDef<DetailRow>[] => [
    {
      accessorKey: "product_name",
      header: "Producto",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product_name}</div>
          {row.original.brand_name && (
            <div className="text-sm text-muted-foreground">
              {row.original.brand_name}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
    },
    {
      accessorKey: "unit",
      header: "Unidad",
    },
    {
      accessorKey: "weight",
      header: "Peso",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.index)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const detailColumns = createDetailColumns(
    handleEditDetail,
    handleDeleteDetail,
  );

  // Submit con validación
  const handleFormSubmit = form.handleSubmit((values) => {
    if (details.length === 0) {
      toast.error("Debe agregar al menos un detalle");
      return;
    }

    const payload = {
      ...values,
      details: details.map((d) => ({
        product_id: d.product_id,
        description: d.description,
        quantity: d.quantity.toString(),
        unit: d.unit,
        weight: d.weight.toString(),
      })),
    };

    onSubmit(payload);
  });

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode={mode} icon={ICON} />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Información General */}
          <GroupFormSection
            icon={Truck}
            title="Información General"
            cols={{ sm: 1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {transportModality === "PUBLICO" && (
                <FormSelect
                  control={form.control}
                  name="carrier_id"
                  label="Transportista"
                  placeholder="Seleccione transportista"
                  options={carriers.map((c) => ({
                    value: c.id.toString(),
                    label: c.business_name || `${c.names} ${c.father_surname}`,
                    description: c.number_document,
                  }))}
                  withValue
                />
              )}

              <FormSelect
                control={form.control}
                name="remittent_id"
                label="Remitente"
                placeholder="Seleccione remitente"
                options={remittents.map((p) => ({
                  value: p.id.toString(),
                  label: p.business_name || `${p.names} ${p.father_surname}`,
                  description: p.number_document,
                }))}
                withValue
              />

              <FormSelect
                control={form.control}
                name="shipping_guide_remittent_id"
                label="Guía de Remisión Remitente (GRR)"
                placeholder="Seleccione GRR (Opcional)"
                options={guides.map((g) => ({
                  value: g.id.toString(),
                  label: g.full_guide_number,
                  description: `${g.issue_date} - ${g.status}`,
                }))}
                withValue
              />

              <FormSelect
                control={form.control}
                name="recipient_id"
                label="Destinatario (Opcional)"
                placeholder="Seleccione destinatario"
                options={recipients.map((p) => ({
                  value: p.id.toString(),
                  label: p.business_name || `${p.names} ${p.father_surname}`,
                  description: p.number_document,
                }))}
                withValue
              />

              {transportModality === "PRIVADO" && (
                <>
                  <FormSelectAsync
                    control={form.control}
                    name="driver_id"
                    label="Conductor"
                    placeholder="Seleccione conductor"
                    useQueryHook={useDrivers}
                    mapOptionFn={(d: PersonResource) => ({
                      value: d.id.toString(),
                      label: `${d.names} ${d.father_surname}`,
                      description: d.number_document,
                    })}
                    withValue
                  />

                  <FormSelect
                    control={form.control}
                    name="vehicle_id"
                    label="Vehículo"
                    placeholder="Seleccione vehículo"
                    options={vehicles.map((v) => ({
                      value: v.id.toString(),
                      label: v.plate,
                      description: `${v.brand} ${v.model}`,
                    }))}
                    withValue
                  />

                  <FormSelect
                    control={form.control}
                    name="secondary_vehicle_id"
                    label="Vehículo Secundario (Opcional)"
                    placeholder="Seleccione vehículo secundario"
                    options={vehicles.map((v) => ({
                      value: v.id.toString(),
                      label: v.plate,
                      description: `${v.brand} ${v.model}`,
                    }))}
                    withValue
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
                    name="vehicle_plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa del Vehículo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: ABC-123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca del Vehículo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo del Vehículo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Hilux" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_mtc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificado MTC</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: MTC123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </GroupFormSection>

          {/* Fechas y Direcciones */}
          <GroupFormSection
            icon={MapPin}
            title="Fechas y Direcciones"
            cols={{ sm: 1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePickerFormField
                control={form.control}
                name="issue_date"
                label="Fecha de Emisión"
                placeholder="Seleccione fecha"
              />

              <DatePickerFormField
                control={form.control}
                name="transfer_start_date"
                label="Fecha Inicio de Traslado"
                placeholder="Seleccione fecha"
              />

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

              <SelectSearchForm
                control={form.control}
                name="origin_ubigeo_id"
                label="Ubigeo de Origen"
                placeholder="Buscar ubigeo..."
                isSearching={isSearchingOrigin}
                items={originUbigeos}
                onSearch={handleSearchOriginUbigeos}
                formatLabel={(item) => formatUbigeoLabel(item)}
                getItemId={(item) => item.id}
              />

              <SelectSearchForm
                control={form.control}
                name="destination_ubigeo_id"
                label="Ubigeo de Destino"
                placeholder="Buscar ubigeo..."
                isSearching={isSearchingDestination}
                items={destinationUbigeos}
                onSearch={handleSearchDestinationUbigeos}
                formatLabel={(item) => formatUbigeoLabel(item)}
                getItemId={(item) => item.id}
              />
            </div>
          </GroupFormSection>

          {/* Observaciones */}
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Notas adicionales"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Detalles de Productos */}
          <GroupFormSection
            icon={Truck}
            title="Detalles de Productos"
            cols={{ sm: 1 }}
          >
            <div className="space-y-4">
              {/* Formulario inline */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border p-3 rounded-lg bg-muted/30">
                <SearchableSelectAsync
                  label="Seleccione producto"
                  useQueryHook={useProduct}
                  mapOptionFn={(product) => ({
                    value: product.id.toString(),
                    label: product.name,
                    description: product.brand_name,
                  })}
                  value={currentDetail.product_id || ""}
                  onChange={(value) =>
                    setCurrentDetail({ ...currentDetail, product_id: value })
                  }
                  onValueChange={(_value, item) =>
                    setSelectedProduct(item as ProductResource | undefined)
                  }
                  withValue
                  placeholder="Buscar producto..."
                  className="md:w-full"
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cantidad
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentDetail.quantity || ""}
                    onChange={(e) =>
                      setCurrentDetail({
                        ...currentDetail,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <SearchableSelect
                  label="Unidad"
                  options={UNIT_MEASUREMENTS.map((u) => ({
                    value: u.value,
                    label: u.label,
                  }))}
                  value={currentDetail.unit || UNIT_MEASUREMENTS[0].value}
                  onChange={(value) =>
                    setCurrentDetail({ ...currentDetail, unit: value })
                  }
                  placeholder="Seleccione unidad"
                  className="md:w-full"
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Peso</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentDetail.weight || ""}
                    onChange={(e) =>
                      setCurrentDetail({
                        ...currentDetail,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">
                    Descripción
                  </label>
                  <Input
                    value={currentDetail.description || ""}
                    onChange={(e) =>
                      setCurrentDetail({
                        ...currentDetail,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descripción adicional"
                  />
                </div>

                <div className="md:col-span-6 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleAddOrUpdateDetail}
                    size="sm"
                  >
                    {editingDetailIndex !== null ? (
                      <>
                        <Pencil className="h-4 w-4 mr-1" /> Actualizar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" /> Agregar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Tabla de detalles */}
              {details.length > 0 && (
                <DataTable columns={detailColumns} data={details} />
              )}
            </div>
          </GroupFormSection>

          {form.formState.errors &&
            Object.keys(form.formState.errors).length > 0 && (
              <div className="p-4 bg-red-100 text-red-800 rounded">
                <strong>Errores de validación:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(form.formState.errors).map(
                    ([field, error]) => {
                      if (Array.isArray(error)) {
                        return error.map((err, idx) => {
                          if (typeof err === "object" && err !== null) {
                            return Object.entries(err).map(([key, val]) => (
                              <li key={`${field}-${idx}-${key}`}>
                                {field}[{idx}].{key}:{" "}
                                {typeof val === "object" &&
                                val !== null &&
                                "message" in val
                                  ? (val as { message: string }).message
                                  : "Error en este campo"}
                              </li>
                            ));
                          }
                          return (
                            <li key={`${field}-${idx}`}>
                              {field}[{idx}]:{" "}
                              {typeof err === "object" && err?.message
                                ? err.message
                                : "Error en este campo"}
                            </li>
                          );
                        });
                      }
                      return (
                        <li key={field}>
                          {field}: {error?.message || "Error en este campo"}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTE)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : mode === "create" ? (
                "Guardar"
              ) : (
                "Actualizar"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormWrapper>
  );
}
