import { useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TitleFormComponent from "@/components/TitleFormComponent";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader, Truck, MapPin, Pencil } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DataTable } from "@/components/DataTable";
import type { UbigeoResource } from "@/pages/guide/lib/ubigeo.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { GuideResource } from "@/pages/guide/lib/guide.interface";
import { findGuideById } from "@/pages/guide/lib/guide.actions";
import { toast } from "sonner";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useDrivers } from "@/pages/driver/lib/driver.hook";
import { useUbigeosFrom, useUbigeosTo } from "@/pages/guide/lib/ubigeo.hook";
import { useCarriers } from "@/pages/carrier/lib/carrier.hook";
import { useVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import PageWrapper from "@/components/PageWrapper";
import { useGuides } from "@/pages/guide/lib/guide.hook";
import { useClients } from "@/pages/client/lib/client.hook";
import type { Option } from "@/lib/core.interface";
import { FormInput } from "@/components/FormInput";
import { FormTextArea } from "@/components/FormTextArea";
import { Separator } from "@/components/ui/separator";

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
  third_party_id?: string;
  payment_responsible?: string;
  origin_address: string;
  origin_ubigeo_id: string;
  destination_address: string;
  destination_ubigeo_id: string;
  observations?: string;
  total_weight: number;
  total_packages: number;
  details: {
    product_id: string;
    description: string;
    quantity: string;
    unit: string;
    weight: string;
  }[];
};

const defaultValues: ShippingGuideCarrierFormValues = {
  transport_modality: "PUBLICO",
  carrier_id: "",
  driver_id: "",
  vehicle_id: "",
  vehicle_plate: "",
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_mtc: "",
  driver_license: "",
  issue_date: new Date().toISOString().split("T")[0],
  transfer_start_date: new Date().toISOString().split("T")[0],
  remittent_id: "",
  recipient_id: "",
  secondary_vehicle_id: "",
  order_id: "",
  shipping_guide_remittent_id: "",
  third_party_id: "",
  payment_responsible: "",
  origin_address: "",
  origin_ubigeo_id: "",
  destination_address: "",
  destination_ubigeo_id: "",
  observations: "",
  total_weight: 0,
  total_packages: 1,
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
}

export function ShippingGuideCarrierForm({
  mode = "create",
  onSubmit,
  isSubmitting = false,
  initialValues,
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

  const [guideAutoFill, setGuideAutoFill] = useState<{
    recipientOption?: Option;
    originUbigeoOption?: Option;
    destinationUbigeoOption?: Option;
    selectorKey: number;
  }>({ selectorKey: 0 });

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

  // Auto-setear transportista a 1860 cuando es PÚBLICO y limpiar campos de conductor/vehículo
  useEffect(() => {
    if (transportModality === "PUBLICO") {
      if (mode === "create") {
        form.setValue("carrier_id", "1860");
      }
      // Limpiar campos de conductor y vehículo cuando es público
      form.setValue("driver_id", "");
      form.setValue("vehicle_id", "");
      form.setValue("secondary_vehicle_id", "");
      form.setValue("driver_license", "");
      form.setValue("vehicle_plate", "");
      form.setValue("vehicle_brand", "");
      form.setValue("vehicle_model", "");
      form.setValue("vehicle_mtc", "");
    }
  }, [transportModality, mode, form]);

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

  // Cargar datos cuando se selecciona una guía de remisión
  useEffect(() => {
    const loadGuideDetails = async () => {
      if (!selectedGuideId || selectedGuideId === "") {
        return;
      }

      try {
        const response = await findGuideById(parseInt(selectedGuideId));
        const guide = response.data;

        // Auto-llenar modalidad de transporte (siempre PUBLICO por defecto)
        form.setValue("transport_modality", "PUBLICO");

        // Auto-llenar destinatario
        if (guide.recipient?.id) {
          form.setValue("recipient_id", guide.recipient.id.toString());
        }

        // Auto-llenar ubigeos y direcciones
        if (guide.originUbigeo?.id) {
          form.setValue("origin_ubigeo_id", guide.originUbigeo.id.toString());
        }
        if (guide.destinationUbigeo?.id) {
          form.setValue(
            "destination_ubigeo_id",
            guide.destinationUbigeo.id.toString(),
          );
        }
        if (guide.origin_address) {
          form.setValue("origin_address", guide.origin_address);
        }
        if (guide.destination_address) {
          form.setValue("destination_address", guide.destination_address);
        }

        // Actualizar opciones para que los selects muestren la etiqueta correcta
        setGuideAutoFill((prev) => ({
          selectorKey: prev.selectorKey + 1,
          recipientOption: guide.recipient?.id
            ? {
                value: guide.recipient.id.toString(),
                label:
                  guide.recipient.business_name ??
                  `${guide.recipient.names ?? ""} ${guide.recipient.father_surname ?? ""}`.trim(),
                description: guide.recipient.number_document ?? undefined,
              }
            : undefined,
          originUbigeoOption: guide.originUbigeo?.id
            ? {
                value: guide.originUbigeo.id.toString(),
                label: guide.originUbigeo.name,
                description: guide.originUbigeo.cadena,
              }
            : undefined,
          destinationUbigeoOption: guide.destinationUbigeo?.id
            ? {
                value: guide.destinationUbigeo.id.toString(),
                label: guide.destinationUbigeo.name,
                description: guide.destinationUbigeo.cadena,
              }
            : undefined,
        }));

        // Cargar detalles
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

  // Calcular automáticamente el peso total
  useEffect(() => {
    if (details.length > 0) {
      const totalWeight = details.reduce(
        (sum, detail) => sum + Number(detail.weight || 0),
        0,
      );

      // Actualizar el total_weight solo si cambió
      const currentTotalWeight = form.getValues("total_weight");
      if (currentTotalWeight !== totalWeight && totalWeight > 0) {
        form.setValue("total_weight", totalWeight, { shouldValidate: false });
      }
    }
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
            onClick={() => onEdit(row.index)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
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
    <PageWrapper>
      <TitleFormComponent title={MODEL.name} mode={mode} icon={ICON} />

      <Form {...form}>
        <form
          onSubmit={handleFormSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Información General */}
          <GroupFormSection
            icon={Truck}
            title="Información General"
            cols={{ sm: 1, md: 3 }}
          >
            <FormSelectAsync
              control={form.control}
              name="shipping_guide_remittent_id"
              label="Guía de Remisión Remitente (GRR)"
              placeholder="Seleccione GRR (Opcional)"
              useQueryHook={useGuides}
              mapOptionFn={(g: GuideResource) => ({
                value: g.id.toString(),
                label: g.full_guide_number,
                description: `${g.issue_date} - ${g.status}`,
              })}
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

            <FormSelectAsync
              control={form.control}
              name="carrier_id"
              label="Transportista"
              placeholder="Seleccione un transportista"
              useQueryHook={useCarriers}
              mapOptionFn={(carrier) => ({
                value: carrier.id.toString(),
                label:
                  carrier.business_name ||
                  `${carrier.names} ${carrier.father_surname} ${carrier.mother_surname}`.trim(),
                description: carrier.number_document,
              })}
              withValue
              preloadItemId={form.getValues("carrier_id") ?? undefined}
            />

            <FormSelectAsync
              control={form.control}
              name="remittent_id"
              label="Remitente"
              placeholder="Seleccione remitente"
              useQueryHook={useClients}
              additionalParams={{
                per_page: 1000,
              }}
              mapOptionFn={(p: PersonResource) => ({
                value: p.id.toString(),
                label: p.business_name ?? `${p.names} ${p.father_surname}`,
                description: p.number_document,
              })}
              withValue
              preloadItemId={initialValues?.remittent_id}
            />

            <FormSelectAsync
              key={`recipient-${guideAutoFill.selectorKey}`}
              control={form.control}
              name="recipient_id"
              label="Destinatario (Opcional)"
              placeholder="Seleccione destinatario"
              useQueryHook={useClients}
              mapOptionFn={(p: PersonResource) => ({
                value: p.id.toString(),
                label: p.business_name ?? `${p.names} ${p.father_surname}`,
                description: p.number_document,
              })}
              withValue
              defaultOption={guideAutoFill.recipientOption}
            />

            <FormSelectAsync
              control={form.control}
              name="third_party_id"
              label="Tercero (Opcional)"
              placeholder="Seleccione tercero"
              useQueryHook={useClients}
              mapOptionFn={(p: PersonResource) => ({
                value: p.id.toString(),
                label: p.business_name ?? `${p.names} ${p.father_surname}`,
                description: p.number_document,
              })}
              withValue
              preloadItemId={initialValues?.third_party_id}
            />

            <FormSelect
              control={form.control}
              name="payment_responsible"
              label="Responsable de Pago (Opcional)"
              placeholder="Seleccione responsable"
              options={[
                { value: "remitente", label: "Remitente" },
                { value: "destinatario", label: "Destinatario" },
                { value: "tercero", label: "Tercero" },
              ]}
            />

            <Separator className="col-span-full" />

            <FormSelectAsync
              control={form.control}
              name="driver_id"
              label="Conductor"
              placeholder="Seleccione conductor"
              useQueryHook={useDrivers}
              mapOptionFn={(d: PersonResource) => ({
                value: d.id.toString(),
                label:
                  d.business_name ??
                  `${d.names} ${d.father_surname} ${d.mother_surname}`.trim(),
                description: d.number_document,
              })}
              withValue
              preloadItemId={initialValues?.driver_id}
            />

            <FormSelectAsync
              control={form.control}
              name="vehicle_id"
              label="Vehículo"
              placeholder="Seleccione vehículo"
              useQueryHook={useVehicles}
              mapOptionFn={(vehicle) => ({
                value: vehicle.id.toString(),
                label: vehicle.plate,
                description: `${vehicle.brand} ${vehicle.model}`,
              })}
              onValueChange={(_value, vehicle: any) => {
                if (vehicle) {
                  form.setValue("vehicle_plate", vehicle.plate || "");
                  form.setValue("vehicle_brand", vehicle.brand || "");
                  form.setValue("vehicle_model", vehicle.model || "");
                  form.setValue("vehicle_mtc", vehicle.mtc_certificate || "");
                }
              }}
              withValue
              preloadItemId={initialValues?.vehicle_id}
            />

            <FormSelectAsync
              control={form.control}
              name="secondary_vehicle_id"
              label="Vehículo Secundario (Opcional)"
              placeholder="Seleccione vehículo secundario"
              useQueryHook={useVehicles}
              mapOptionFn={(vehicle) => ({
                value: vehicle.id.toString(),
                label: vehicle.plate,
                description: `${vehicle.brand} ${vehicle.model}`,
              })}
              withValue
              preloadItemId={initialValues?.secondary_vehicle_id}
            />

            <FormInput
              control={form.control}
              name="driver_license"
              label="Licencia del Conductor"
              placeholder="Ej: B12345678"
              className="border-dashed"
            />

            <FormInput
              control={form.control}
              name="vehicle_plate"
              label="Placa del Vehículo"
              placeholder="Ej: ABC-123"
              className="border-dashed"
            />

            <FormInput
              control={form.control}
              name="vehicle_brand"
              label="Marca del Vehículo"
              placeholder="Ej: Toyota"
              className="border-dashed"
            />

            <FormInput
              control={form.control}
              name="vehicle_model"
              label="Modelo del Vehículo"
              placeholder="Ej: Hilux"
              className="border-dashed"
            />

            <FormInput
              control={form.control}
              name="vehicle_mtc"
              label="Certificado MTC (Opcional)"
              placeholder="Ej: MTC123456"
              className="border-dashed"
            />

            {/* Observaciones */}
            <div className="col-span-full">
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

              <FormInput
                control={form.control}
                name="total_weight"
                label="Peso Total (Kg)"
                placeholder="Ej: 100"
                type="number"
                min={0}
              />

              <FormInput
                control={form.control}
                name="total_packages"
                label="Total de Paquetes"
                placeholder="Ej: 5"
                type="number"
                min={0}
              />

              <FormSelectAsync
                key={`origin-ubigeo-${guideAutoFill.selectorKey}`}
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
                preloadItemId={initialValues?.origin_ubigeo_id}
                defaultOption={guideAutoFill.originUbigeoOption}
              />

              <FormSelectAsync
                key={`dest-ubigeo-${guideAutoFill.selectorKey}`}
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
                preloadItemId={initialValues?.destination_ubigeo_id}
                defaultOption={guideAutoFill.destinationUbigeoOption}
              />
              <div className="col-span-full">
                <FormTextArea
                  control={form.control}
                  name="origin_address"
                  label="Dirección de Origen"
                  placeholder="Calle, número, ciudad"
                />
              </div>

              <div className="col-span-full">
                <FormTextArea
                  control={form.control}
                  name="destination_address"
                  label="Dirección de Destino"
                  placeholder="Calle, número, ciudad"
                />
              </div>
            </div>
          </GroupFormSection>

          {/* Detalles de Productos */}
          <GroupFormSection
            icon={Truck}
            title="Detalles de Productos"
            cols={{ sm: 1 }}
            className="col-span-full"
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

                <FormInput
                  name="quantity"
                  label="Cantidad"
                  placeholder="Ej: 10.5"
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(e) =>
                    setCurrentDetail({
                      ...currentDetail,
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                />

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

                <FormInput
                  name="weight"
                  label="Peso"
                  placeholder="Ej: 10.5"
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(e) =>
                    setCurrentDetail({
                      ...currentDetail,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <FormInput
                  name="description"
                  label="Descripción"
                  placeholder="Ej: Producto frágil, manejar con cuidado"
                  onChange={(e) =>
                    setCurrentDetail({
                      ...currentDetail,
                      description: e.target.value,
                    })
                  }
                />

                <div className="md:col-span-6 flex justify-end">
                  <Button type="button" onClick={handleAddOrUpdateDetail}>
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
              <div className="p-4 bg-red-100 text-red-800 rounded col-span-full">
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

          <div className="flex justify-end gap-3 col-span-full">
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
    </PageWrapper>
  );
}
