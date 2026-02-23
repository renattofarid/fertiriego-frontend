import { useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TitleFormComponent from "@/components/TitleFormComponent";
import FormWrapper from "@/components/FormWrapper";
import { PRODUCTION_DOCUMENT } from "../lib/production-document.interface";
import { productionDocumentSchema } from "../lib/production-document.schema";
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
import { Plus, Trash2, Loader, Factory, Pencil } from "lucide-react";
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
import { useAuthStore } from "@/pages/auth/lib/auth.store";

export type ProductionDocumentFormValues = {
  warehouse_origin_id: string;
  warehouse_dest_id: string;
  product_id: string;
  user_id: string;
  responsible_id: string;
  production_date: string;
  quantity_produced: string;
  labor_cost: string;
  overhead_cost: string;
  observations?: string;
  components: {
    component_id: string;
    component_name?: string;
    quantity_required: string;
    quantity_used: string;
    unit_cost: string;
    notes?: string;
  }[];
};

interface ProductionDocumentFormProps {
  mode?: "create" | "edit";
  onSubmit: (values: ProductionDocumentFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: ProductionDocumentFormValues;
  warehouses: WarehouseResource[];
}

export function ProductionDocumentForm({
  mode = "create",
  onSubmit,
  isSubmitting = false,
  initialValues,
  warehouses,
}: ProductionDocumentFormProps) {
  const { ROUTE, MODEL, ICON } = PRODUCTION_DOCUMENT;
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const componentForm = useForm<{ component_id: string; user_id: string }>({
    defaultValues: { component_id: "", user_id: user?.id.toString() || "" },
  });

  const defaultValues: ProductionDocumentFormValues = {
    warehouse_origin_id: "",
    warehouse_dest_id: "",
    product_id: "",
    user_id: user?.id.toString() || "",
    responsible_id: "",
    production_date: "",
    quantity_produced: "",
    labor_cost: "",
    overhead_cost: "",
    observations: "",
    components: [],
  };

  // Estado para detalles
  type ComponentRow = {
    component_id: string;
    component_name: string;
    quantity_required: number;
    quantity_used: number;
    unit_cost: number;
    notes: string;
  };

  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [currentComponent, setCurrentComponent] = useState<
    Partial<ComponentRow>
  >({
    component_id: "",
    quantity_required: 0,
    quantity_used: 0,
    unit_cost: 0,
    notes: "",
  });
  const [editingComponentIndex, setEditingComponentIndex] = useState<
    number | null
  >(null);

  const form = useForm<ProductionDocumentFormValues>({
    resolver: zodResolver(
      productionDocumentSchema,
    ) as Resolver<ProductionDocumentFormValues>,
    defaultValues: initialValues ?? defaultValues,
  });

  // Cargar componentes iniciales cuando hay initialValues
  useEffect(() => {
    if (initialValues?.components && initialValues.components.length > 0) {
      const mappedComponents: ComponentRow[] = initialValues.components.map(
        (c) => ({
          component_id: c.component_id,
          component_name: c.component_name || "Componente desconocido",
          quantity_required: parseFloat(c.quantity_required) || 0,
          quantity_used: parseFloat(c.quantity_used) || 0,
          unit_cost: parseFloat(c.unit_cost) || 0,
          notes: c.notes || "",
        }),
      );
      setComponents(mappedComponents);
    }
  }, [initialValues]);

  // Agregar/Actualizar componente
  const handleAddOrUpdateComponent = () => {
    if (
      !currentComponent.component_id ||
      !currentComponent.component_name ||
      !currentComponent.quantity_required ||
      !currentComponent.quantity_used ||
      currentComponent.unit_cost === undefined
    ) {
      toast.error("Complete todos los campos del componente");
      return;
    }

    const newComponent: ComponentRow = {
      component_id: currentComponent.component_id,
      component_name: currentComponent.component_name,
      quantity_required: currentComponent.quantity_required,
      quantity_used: currentComponent.quantity_used,
      unit_cost: currentComponent.unit_cost,
      notes: currentComponent.notes || "",
    };

    if (editingComponentIndex !== null) {
      const updated = [...components];
      updated[editingComponentIndex] = newComponent;
      setComponents(updated);
      setEditingComponentIndex(null);
    } else {
      setComponents([...components, newComponent]);
    }

    componentForm.reset({ component_id: "" });
    setCurrentComponent({
      component_id: "",
      component_name: "",
      quantity_required: 0,
      quantity_used: 0,
      unit_cost: 0,
      notes: "",
    });
  };

  // Editar componente
  const handleEditComponent = (index: number) => {
    const component = components[index];
    componentForm.setValue("component_id", component.component_id);
    setCurrentComponent({
      component_id: component.component_id,
      component_name: component.component_name,
      quantity_required: component.quantity_required,
      quantity_used: component.quantity_used,
      unit_cost: component.unit_cost,
      notes: component.notes,
    });
    setEditingComponentIndex(index);
  };

  // Eliminar componente
  const handleDeleteComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Sincronizar components con form
  useEffect(() => {
    const formatted = components.map((c) => ({
      component_id: c.component_id,
      quantity_required: c.quantity_required.toString(),
      quantity_used: c.quantity_used.toString(),
      unit_cost: c.unit_cost.toString(),
      notes: c.notes,
    }));
    form.setValue("components", formatted);
  }, [components, form]);

  // Columnas para DataTable
  const createComponentColumns = (
    onEdit: (index: number) => void,
    onDelete: (index: number) => void,
  ): ColumnDef<ComponentRow>[] => [
    {
      accessorKey: "component_name",
      header: "Componente",
      cell: ({ row }) => <span>{row.original.component_name}</span>,
    },
    {
      accessorKey: "quantity_required",
      header: "Cantidad Requerida",
      cell: ({ row }) => <span>{row.original.quantity_required}</span>,
    },
    {
      accessorKey: "quantity_used",
      header: "Cantidad Usada",
      cell: ({ row }) => <span>{row.original.quantity_used}</span>,
    },
    {
      accessorKey: "unit_cost",
      header: "Costo Unitario",
      cell: ({ row }) => <span>S/ {row.original.unit_cost.toFixed(2)}</span>,
    },
    {
      accessorKey: "notes",
      header: "Notas",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.notes || "-"}
        </span>
      ),
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

  const componentColumns = createComponentColumns(
    handleEditComponent,
    handleDeleteComponent,
  );

  // Submit con validación
  const handleFormSubmit = form.handleSubmit((values) => {
    if (components.length === 0) {
      toast.error("Debe agregar al menos un componente");
      return;
    }

    const payload = {
      ...values,
      components: components.map((c) => ({
        component_id: c.component_id,
        quantity_required: c.quantity_required.toString(),
        quantity_used: c.quantity_used.toString(),
        unit_cost: c.unit_cost.toString(),
        notes: c.notes,
      })),
    };

    onSubmit(payload);
  });

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent
            title={MODEL.name}
            mode={mode}
            icon={ICON}
            backRoute={ROUTE}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Información General */}
          <GroupFormSection
            icon={Factory}
            title="Información General"
            cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          >
            <FormSelect
              control={form.control}
              name="warehouse_origin_id"
              label="Almacén Origen"
              placeholder="Seleccione almacén de origen"
              options={warehouses.map((w) => ({
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
              options={warehouses.map((w) => ({
                value: w.id.toString(),
                label: w.name,
                description: w.address,
              }))}
              withValue
            />

            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto"
              placeholder="Seleccione producto"
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
              placeholder="Seleccione responsable"
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
              name="production_date"
              label="Fecha de Producción"
              placeholder="Seleccione fecha"
            />

            <FormField
              control={form.control}
              name="quantity_produced"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Producida</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="labor_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Laboral (S/)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
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
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-full">
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
            </div>
          </GroupFormSection>

          {/* Componentes */}
          <GroupFormSection icon={Factory} title="Componentes" cols={{ sm: 1 }}>
            <div className="space-y-4">
              {/* Formulario inline */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border p-3 rounded-lg bg-muted/30">
                <div className=" md:col-span-2">
                  <FormSelectAsync
                    control={componentForm.control}
                    name="component_id"
                    label="Componente"
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
                    placeholder="Buscar componente..."
                    className="md:w-full"
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
                      setCurrentComponent({
                        ...currentComponent,
                        quantity_required: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Cant. Usada</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentComponent.quantity_used || ""}
                    onChange={(e) =>
                      setCurrentComponent({
                        ...currentComponent,
                        quantity_used: parseFloat(e.target.value) || 0,
                      })
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
                      setCurrentComponent({
                        ...currentComponent,
                        unit_cost: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <Button type="button" onClick={handleAddOrUpdateComponent}>
                  <Plus />
                  {editingComponentIndex !== null ? "Actualizar" : "Agregar"}
                </Button>
              </div>

              {components.length > 0 && (
                <DataTable columns={componentColumns} data={components} />
              )}
            </div>
          </GroupFormSection>

          {form.formState.errors &&
            Object.keys(form.formState.errors).length > 0 && (
              <div className="p-4 bg-red-100 text-red-800 rounded">
                <strong>Errores de validación:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(form.formState.errors).map(([key, error]) => (
                    <li key={key}>
                      {key}: {(error as any)?.message || "Error"}
                    </li>
                  ))}
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
