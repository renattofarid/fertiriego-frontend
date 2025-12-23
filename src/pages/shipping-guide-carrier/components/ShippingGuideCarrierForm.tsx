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
import { toast } from "sonner";
import type { GuideResource } from "@/pages/guide/lib/guide.interface";

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
  carriers: PersonResource[];
  remittents: GuideResource[];
  drivers: PersonResource[];
  vehicles: VehicleResource[];
  products: ProductResource[];
}

export function ShippingGuideCarrierForm({
  mode = "create",
  onSubmit,
  isSubmitting = false,
  initialValues,
  carriers,
  remittents,
  drivers,
  vehicles,
  products,
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
    null
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
      shippingGuideCarrierSchema
    ) as Resolver<ShippingGuideCarrierFormValues>,
    defaultValues: initialValues ?? {
      ...defaultValues,
      details: [],
    },
  });

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
    []
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

    const product = products.find(
      (p) => p.id.toString() === currentDetail.product_id
    );
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    const newDetail: DetailRow = {
      product_id: currentDetail.product_id,
      product_name: product.name,
      brand_name: product.brand_name,
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
    onDelete: (index: number) => void
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
    handleDeleteDetail
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

              <FormSelect
                control={form.control}
                name="shipping_guide_remittent_id"
                label="Guía Remitente"
                placeholder="Seleccione guía remitente"
                options={remittents.map((r) => ({
                  value: r.id.toString(),
                  label: r.full_guide_number,
                  description: r.status,
                }))}
                withValue
              />

              <FormSelect
                control={form.control}
                name="driver_id"
                label="Conductor"
                placeholder="Seleccione conductor"
                options={drivers.map((d) => ({
                  value: d.id.toString(),
                  label: `${d.names} ${d.father_surname}`,
                  description: d.number_document,
                }))}
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
                <SearchableSelect
                  label="Seleccione producto"
                  options={products.map((p) => ({
                    value: p.id.toString(),
                    label: p.name,
                    description: p.brand_name,
                  }))}
                  value={currentDetail.product_id || ""}
                  onChange={(value) =>
                    setCurrentDetail({ ...currentDetail, product_id: value })
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
