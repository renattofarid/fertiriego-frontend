import { useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TitleFormComponent from "@/components/TitleFormComponent";
import FormWrapper from "@/components/FormWrapper";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import { productionOrderSchema } from "../lib/production-order.schema";
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
import { Plus, Trash2, Loader, ClipboardList, Pencil } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useProduct } from "@/pages/product/lib/product.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useWorkers } from "@/pages/worker/lib/worker.hook";

export type ProductionOrderFormValues = {
  warehouse_origin_id: string;
  warehouse_dest_id: string;
  product_id: string;
  responsible_id: string;
  requested_date: string;
  quantity_requested: string;
  currency: string;
  labor_cost: string;
  overhead_cost: string;
  observations?: string;
  components: {
    component_id: string;
    component_name?: string;
    quantity_required: string;
    unit_cost: string;
    waste_quantity: string;
    waste_percentage: string;
    notes?: string;
  }[];
};

interface ProductionOrderFormProps {
  mode?: "create" | "edit";
  onSubmit: (values: ProductionOrderFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: ProductionOrderFormValues;
  warehouses: WarehouseResource[];
}

type ComponentRow = {
  component_id: string;
  component_name: string;
  quantity_required: number;
  unit_cost: number;
  waste_quantity: number;
  waste_percentage: number;
  notes: string;
};

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "PEN - Sol Peruano" },
  { value: "USD", label: "USD - Dólar" },
];

export function ProductionOrderForm({
  mode = "create",
  onSubmit,
  isSubmitting = false,
  initialValues,
  warehouses,
}: ProductionOrderFormProps) {
  const { ROUTE, MODEL, ICON } = PRODUCTION_ORDER;
  const navigate = useNavigate();

  const defaultValues: ProductionOrderFormValues = {
    warehouse_origin_id: "",
    warehouse_dest_id: "",
    product_id: "",
    responsible_id: "",
    requested_date: "",
    quantity_requested: "",
    currency: "PEN",
    labor_cost: "0",
    overhead_cost: "0",
    observations: "",
    components: [],
  };

  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [currentComponent, setCurrentComponent] = useState<Partial<ComponentRow>>({
    component_id: "",
    component_name: "",
    quantity_required: 0,
    unit_cost: 0,
    waste_quantity: 0,
    waste_percentage: 0,
    notes: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const componentForm = useForm<{ component_id: string }>({
    defaultValues: { component_id: "" },
  });

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const form = useForm<ProductionOrderFormValues>({
    resolver: zodResolver(productionOrderSchema) as Resolver<ProductionOrderFormValues>,
    defaultValues: initialValues ?? { ...defaultValues, requested_date: todayStr },
  });

  const warehouseOriginId = form.watch("warehouse_origin_id");
  const warehouseDestId = form.watch("warehouse_dest_id");


  useEffect(() => {
    if (initialValues?.components && initialValues.components.length > 0) {
      const mapped: ComponentRow[] = initialValues.components.map((c) => ({
        component_id: c.component_id,
        component_name: c.component_name || "Componente",
        quantity_required: parseFloat(c.quantity_required) || 0,
        unit_cost: parseFloat(c.unit_cost) || 0,
        waste_quantity: parseFloat(c.waste_quantity) || 0,
        waste_percentage: parseFloat(c.waste_percentage) || 0,
        notes: c.notes || "",
      }));
      setComponents(mapped);
    }
  }, [initialValues]);

  useEffect(() => {
    const formatted = components.map((c) => ({
      component_id: c.component_id,
      component_name: c.component_name,
      quantity_required: c.quantity_required.toString(),
      unit_cost: c.unit_cost.toString(),
      waste_quantity: c.waste_quantity.toString(),
      waste_percentage: c.waste_percentage.toString(),
      notes: c.notes,
    }));
    form.setValue("components", formatted);
  }, [components, form]);

  const handleAddOrUpdate = () => {
    if (!currentComponent.component_id || !currentComponent.component_name) {
      toast.error("Debe seleccionar un componente");
      return;
    }
    if (!currentComponent.quantity_required || currentComponent.quantity_required <= 0) {
      toast.error("La cantidad requerida debe ser mayor a 0");
      return;
    }

    const row: ComponentRow = {
      component_id: currentComponent.component_id!,
      component_name: currentComponent.component_name!,
      quantity_required: currentComponent.quantity_required ?? 0,
      unit_cost: currentComponent.unit_cost ?? 0,
      waste_quantity: currentComponent.waste_quantity ?? 0,
      waste_percentage: currentComponent.waste_percentage ?? 0,
      notes: currentComponent.notes ?? "",
    };

    if (editingIndex !== null) {
      const updated = [...components];
      updated[editingIndex] = row;
      setComponents(updated);
      setEditingIndex(null);
    } else {
      setComponents([...components, row]);
    }

    componentForm.reset({ component_id: "" });
    setCurrentComponent({
      component_id: "",
      component_name: "",
      quantity_required: 0,
      unit_cost: 0,
      waste_quantity: 0,
      waste_percentage: 0,
      notes: "",
    });
  };

  const handleEdit = (index: number) => {
    const c = components[index];
    componentForm.setValue("component_id", c.component_id);
    setCurrentComponent({ ...c });
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const componentColumns: ColumnDef<ComponentRow>[] = [
    {
      accessorKey: "component_name",
      header: "Componente",
      cell: ({ row }) => <span className="font-medium">{row.original.component_name}</span>,
    },
    {
      accessorKey: "quantity_required",
      header: "Cant. Req.",
      cell: ({ row }) => <span>{row.original.quantity_required}</span>,
    },
    {
      accessorKey: "unit_cost",
      header: "Costo Unit.",
      cell: ({ row }) => <span>S/ {row.original.unit_cost.toFixed(2)}</span>,
    },
    {
      accessorKey: "waste_quantity",
      header: "Merma Cant.",
      cell: ({ row }) => <span>{row.original.waste_quantity}</span>,
    },
    {
      accessorKey: "waste_percentage",
      header: "Merma %",
      cell: ({ row }) => <span>{row.original.waste_percentage}%</span>,
    },
    {
      accessorKey: "notes",
      header: "Notas",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.notes || "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => handleEdit(row.index)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" onClick={() => handleDelete(row.index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = form.handleSubmit((values) => {
    if (components.length === 0) {
      toast.error("Debe agregar al menos un componente");
      return;
    }
    const payload: ProductionOrderFormValues = {
      ...values,
      components: components.map((c) => ({
        component_id: c.component_id,
        component_name: c.component_name,
        quantity_required: c.quantity_required.toString(),
        unit_cost: c.unit_cost.toString(),
        waste_quantity: c.waste_quantity.toString(),
        waste_percentage: c.waste_percentage.toString(),
        notes: c.notes,
      })),
    };
    onSubmit(payload);
  });

  return (
    <FormWrapper>
      <div className="mb-6">
        <TitleFormComponent title={MODEL.name} mode={mode} icon={ICON} backRoute={ROUTE} />
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Información General */}
          <GroupFormSection
            icon={ClipboardList}
            title="Información General"
            cols={{ sm: 1, md: 2, lg: 3 }}
          >
            <FormSelect
              control={form.control}
              name="warehouse_origin_id"
              label="Almacén Origen"
              placeholder="Seleccione almacén de origen"
              options={warehouses
                .filter((w) => w.id.toString() !== warehouseDestId)
                .map((w) => ({
                  value: w.id.toString(),
                  label: w.name,
                  description: w.address,
                }))}
              withValue
            />

            <FormSelect
              control={form.control}
              name="warehouse_dest_id"
              label="Almacén Destino"
              placeholder="Seleccione almacén de destino"
              options={warehouses
                .filter((w) => w.id.toString() !== warehouseOriginId)
                .map((w) => ({
                  value: w.id.toString(),
                  label: w.name,
                  description: w.address,
                }))}
              withValue
            />

            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto a Producir"
              placeholder="Buscar producto..."
              useQueryHook={useProduct}
              mapOptionFn={(p: ProductResource) => ({
                value: p.id.toString(),
                label: p.name,
                description: p.unit_name,
              })}
              withValue
            />

            <FormSelectAsync
              control={form.control}
              name="responsible_id"
              label="Responsable"
              placeholder="Buscar responsable..."
              useQueryHook={useWorkers}
              mapOptionFn={(w: PersonResource) => ({
                value: w.id.toString(),
                label:
                  w.business_name ||
                  `${w.names} ${w.father_surname} ${w.mother_surname}`,
                description: w.number_document,
              })}
              withValue
            />

            <DatePickerFormField
              control={form.control}
              name="requested_date"
              label="Fecha Solicitada"
              placeholder="Seleccione fecha"
              disabledRange={{ after: today }}
            />

            <FormField
              control={form.control}
              name="quantity_requested"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Solicitada</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelect
              control={form.control}
              name="currency"
              label="Moneda"
              placeholder="Seleccione moneda"
              options={CURRENCY_OPTIONS}
              withValue
            />

            <FormField
              control={form.control}
              name="labor_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Laboral (S/)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overhead_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Indirecto (S/)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-full">
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Observaciones adicionales..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </GroupFormSection>

          {/* Componentes */}
          <GroupFormSection icon={ClipboardList} title="Componentes" cols={{ sm: 1 }}>
            <div className="space-y-4">
              {/* Formulario inline de componentes */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end border p-3 rounded-lg bg-muted/30">
                <div className="md:col-span-2">
                  <FormSelectAsync
                    control={componentForm.control}
                    name="component_id"
                    label="Componente"
                    placeholder="Buscar componente..."
                    useQueryHook={useProduct}
                    mapOptionFn={(p: ProductResource) => ({
                      value: p.id.toString(),
                      label: p.name,
                      description: p.unit_name,
                    })}
                    onValueChange={(value, item) =>
                      setCurrentComponent((prev) => ({
                        ...prev,
                        component_id: value,
                        component_name: (item as ProductResource)?.name ?? "",
                      }))
                    }
                    withValue
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Cant. Req.</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentComponent.quantity_required || ""}
                    onChange={(e) =>
                      setCurrentComponent({ ...currentComponent, quantity_required: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Costo Unit.</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentComponent.unit_cost || ""}
                    onChange={(e) =>
                      setCurrentComponent({ ...currentComponent, unit_cost: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Merma Cant.</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentComponent.waste_quantity || ""}
                    onChange={(e) =>
                      setCurrentComponent({ ...currentComponent, waste_quantity: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Merma %</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={currentComponent.waste_percentage || ""}
                    onChange={(e) =>
                      setCurrentComponent({ ...currentComponent, waste_percentage: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>

                <Button type="button" onClick={handleAddOrUpdate}>
                  <Plus className="h-4 w-4 mr-1" />
                  {editingIndex !== null ? "Actualizar" : "Agregar"}
                </Button>
              </div>

              {/* Tabla de notas inline cuando hay un componente seleccionado */}
              {currentComponent.component_id && (
                <div className="px-3">
                  <label className="text-sm font-medium">Notas del componente</label>
                  <Input
                    value={currentComponent.notes || ""}
                    onChange={(e) =>
                      setCurrentComponent({ ...currentComponent, notes: e.target.value })
                    }
                    placeholder="Notas opcionales..."
                    className="mt-1"
                    maxLength={500}
                  />
                </div>
              )}

              {components.length > 0 && (
                <DataTable columns={componentColumns} data={components} />
              )}

              {form.formState.errors.components && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.components.message}
                </p>
              )}
            </div>
          </GroupFormSection>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTE)}>
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
