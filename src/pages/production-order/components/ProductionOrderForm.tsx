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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Loader,
  ClipboardList,
  Pencil,
  Package,
  Sparkles,
} from "lucide-react";
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

export type ProductionOrderComponentFormValues = {
  component_id: string;
  component_name?: string;
  quantity_required: string;
  unit_cost: string;
  waste_quantity: string;
  waste_percentage: string;
  notes?: string;
};

export type ProductionOrderItemFormValues = {
  product_id: string;
  product_name?: string;
  quantity_requested: string;
  labor_cost: string;
  // ⚠️ overhead_cost NO se captura aquí: el backend lo calcula
  // automáticamente y se muestra solo como dato de solo lectura en el detalle.
  notes?: string;
  use_combo: boolean;
  components: ProductionOrderComponentFormValues[];
};

export type ProductionOrderFormValues = {
  warehouse_origin_id: string;
  warehouse_dest_id: string;
  responsible_id: string;
  requested_date: string;
  currency: string;
  observations?: string;
  items: ProductionOrderItemFormValues[];
};

interface ProductionOrderFormProps {
  mode?: "create" | "edit";
  onSubmit: (values: ProductionOrderFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: ProductionOrderFormValues;
  warehouses: WarehouseResource[];
  /** El GET por id todavía no expone items[] por separado: en edición solo se puede reconstruir 1 ítem */
  editSingleItemWarning?: boolean;
}

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "PEN - Sol Peruano" },
  { value: "USD", label: "USD - Dólar" },
];

const emptyComponent: ProductionOrderComponentFormValues = {
  component_id: "",
  component_name: "",
  quantity_required: "",
  unit_cost: "",
  waste_quantity: "",
  waste_percentage: "",
  notes: "",
};

const emptyItem = (): ProductionOrderItemFormValues => ({
  product_id: "",
  product_name: "",
  quantity_requested: "",
  labor_cost: "0",
  notes: "",
  use_combo: true,
  components: [],
});

/**
 * Selector de producto/componente aislado con su propio react-hook-form
 * interno, para poder reutilizarlo dentro de un array dinámico de ítems sin
 * que varias instancias compartan (y se pisen) el mismo campo de formulario.
 */
function AsyncProductPicker({
  label,
  placeholder,
  defaultLabel,
  onSelect,
  additionalParams,
}: {
  label?: string;
  placeholder: string;
  defaultLabel?: string;
  onSelect: (value: string, item: ProductResource | undefined) => void;
  additionalParams?: Record<string, any>;
}) {
  const localForm = useForm<{ value: string }>({ defaultValues: { value: "" } });
  return (
    <FormSelectAsync
      control={localForm.control}
      name="value"
      label={label ?? ""}
      placeholder={placeholder}
      useQueryHook={useProduct}
      mapOptionFn={(p: ProductResource) => ({
        value: p.id.toString(),
        label: p.name,
        description: p.unit_name,
      })}
      additionalParams={additionalParams}
      defaultOption={defaultLabel ? { value: "", label: defaultLabel } : undefined}
      onValueChange={(value, item) => onSelect(value, item as ProductResource | undefined)}
      withValue={false}
    />
  );
}

export function ProductionOrderForm({
  mode = "create",
  onSubmit,
  isSubmitting = false,
  initialValues,
  warehouses,
  editSingleItemWarning = false,
}: ProductionOrderFormProps) {
  const { ROUTE, MODEL, ICON } = PRODUCTION_ORDER;
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const defaultValues: ProductionOrderFormValues = {
    warehouse_origin_id: "",
    warehouse_dest_id: "",
    responsible_id: "",
    requested_date: todayStr,
    currency: "PEN",
    observations: "",
    items: [emptyItem()],
  };

  const form = useForm<ProductionOrderFormValues>({
    resolver: zodResolver(productionOrderSchema) as Resolver<ProductionOrderFormValues>,
    defaultValues: initialValues ?? defaultValues,
  });

  const [items, setItems] = useState<ProductionOrderItemFormValues[]>(
    initialValues?.items?.length ? initialValues.items : [emptyItem()],
  );

  // Formulario inline para agregar un componente manual dentro de un ítem
  const [componentDraft, setComponentDraft] = useState<ProductionOrderComponentFormValues>(emptyComponent);
  const [componentTargetItem, setComponentTargetItem] = useState<number | null>(null);
  const [editingComponentIndex, setEditingComponentIndex] = useState<number | null>(null);
  // Se incrementa para forzar el remount del AsyncProductPicker del componente
  // (y así limpiar/precargar su label) cada vez que se abre para editar/agregar.
  const [componentPickerKey, setComponentPickerKey] = useState(0);

  const warehouseOriginId = form.watch("warehouse_origin_id");
  const warehouseDestId = form.watch("warehouse_dest_id");

  useEffect(() => {
    form.setValue("items", items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const updateItem = (index: number, patch: Partial<ProductionOrderItemFormValues>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, emptyItem()]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error("La orden debe tener al menos un producto a producir");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openComponentForm = (itemIndex: number, componentIndex: number | null = null) => {
    setComponentTargetItem(itemIndex);
    setEditingComponentIndex(componentIndex);
    setComponentDraft(
      componentIndex !== null ? { ...items[itemIndex].components[componentIndex] } : emptyComponent,
    );
    setComponentPickerKey((k) => k + 1);
  };

  const handleAddOrUpdateComponent = () => {
    if (componentTargetItem === null) return;
    if (!componentDraft.component_id || !componentDraft.component_name) {
      toast.error("Debe seleccionar un componente");
      return;
    }
    if (!componentDraft.quantity_required || Number(componentDraft.quantity_required) <= 0) {
      toast.error("La cantidad requerida debe ser mayor a 0");
      return;
    }

    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== componentTargetItem) return it;
        const nextComponents = [...it.components];
        if (editingComponentIndex !== null) {
          nextComponents[editingComponentIndex] = componentDraft;
        } else {
          nextComponents.push(componentDraft);
        }
        return { ...it, components: nextComponents };
      }),
    );

    setComponentDraft(emptyComponent);
    setEditingComponentIndex(null);
    setComponentPickerKey((k) => k + 1);
  };

  const handleDeleteComponent = (itemIndex: number, componentIndex: number) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === itemIndex
          ? { ...it, components: it.components.filter((_, ci) => ci !== componentIndex) }
          : it,
      ),
    );
  };

  const makeComponentColumns = (itemIndex: number): ColumnDef<ProductionOrderComponentFormValues>[] => [
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
      cell: ({ row }) => <span>S/ {Number(row.original.unit_cost || 0).toFixed(2)}</span>,
    },
    {
      accessorKey: "waste_percentage",
      header: "Merma %",
      cell: ({ row }) => <span>{row.original.waste_percentage || 0}%</span>,
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
          <Button type="button" variant="ghost" onClick={() => openComponentForm(itemIndex, row.index)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" onClick={() => handleDeleteComponent(itemIndex, row.index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = form.handleSubmit(() => {
    if (items.length === 0) {
      toast.error("Debe agregar al menos un producto a producir");
      return;
    }
    for (const item of items) {
      if (!item.product_id) {
        toast.error("Todos los productos deben estar seleccionados");
        return;
      }
      if (!item.quantity_requested || Number(item.quantity_requested) <= 0) {
        toast.error("La cantidad solicitada debe ser mayor a 0 en todos los productos");
        return;
      }
      if (!item.use_combo && item.components.length === 0) {
        toast.error(
          `Debe agregar al menos un componente manual para "${item.product_name || "el producto"}", o active "usar combo (BOM)"`,
        );
        return;
      }
    }
    const payload: ProductionOrderFormValues = {
      ...form.getValues(),
      items: items.map((it) => ({
        ...it,
        components: it.use_combo ? [] : it.components,
      })),
    };
    onSubmit(payload);
  });

  return (
    <FormWrapper>
      <div className="mb-6">
        <TitleFormComponent title={MODEL.name} mode={mode} icon={ICON} backRoute={ROUTE} />
      </div>

      {editSingleItemWarning && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Esta orden fue creada con un solo producto o el backend aún no expone el detalle por
          múltiples ítems al editar. Si la orden tiene más de un producto, edítala con cuidado:
          solo se muestra el primero.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Información General */}
          <GroupFormSection icon={ClipboardList} title="Información General" cols={{ sm: 1, md: 2, lg: 3 }}>
            <FormSelect
              control={form.control}
              name="warehouse_origin_id"
              label="Almacén Origen"
              placeholder="Seleccione almacén de origen"
              options={warehouses
                .filter((w) => w.id.toString() !== warehouseDestId)
                .map((w) => ({ value: w.id.toString(), label: w.name, description: w.address }))}
              withValue
            />

            <FormSelect
              control={form.control}
              name="warehouse_dest_id"
              label="Almacén Destino"
              placeholder="Seleccione almacén de destino"
              options={warehouses
                .filter((w) => w.id.toString() !== warehouseOriginId)
                .map((w) => ({ value: w.id.toString(), label: w.name, description: w.address }))}
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
                label: w.business_name || `${w.names} ${w.father_surname} ${w.mother_surname}`,
                description: w.number_document,
              })}
              withValue
            />

            <DatePickerFormField
              control={form.control}
              name="requested_date"
              label="Fecha Solicitada"
              placeholder="Seleccione fecha"
            />

            <FormSelect
              control={form.control}
              name="currency"
              label="Moneda"
              placeholder="Seleccione moneda"
              options={CURRENCY_OPTIONS}
              withValue
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

          {/* Productos a producir (ítems anidados) */}
          <GroupFormSection icon={Package} title="Productos a Producir" cols={{ sm: 1 }}>
            <div className="space-y-4">
              {items.map((item, itemIndex) => (
                <div key={itemIndex} className="rounded-lg border p-4 space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Producto #{itemIndex + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(itemIndex)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Quitar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Producto Final</label>
                      <AsyncProductPicker
                        placeholder="Buscar producto..."
                        defaultLabel={item.product_name}
                        onSelect={(value, prod) =>
                          updateItem(itemIndex, {
                            product_id: value,
                            product_name: prod?.name ?? "",
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Cant. Solicitada</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.quantity_requested}
                        onChange={(e) => updateItem(itemIndex, { quantity_requested: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Costo Laboral (S/)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.labor_cost}
                        onChange={(e) => updateItem(itemIndex, { labor_cost: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-sm font-medium">Notas del producto</label>
                      <Input
                        value={item.notes}
                        onChange={(e) => updateItem(itemIndex, { notes: e.target.value })}
                        placeholder="Notas opcionales..."
                        maxLength={500}
                      />
                    </div>
                  </div>

                  {/* Toggle combo (BOM) vs componentes manuales */}
                  <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
                    <Switch
                      checked={item.use_combo}
                      onCheckedChange={(checked) => updateItem(itemIndex, { use_combo: checked })}
                    />
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Usar combo automático (BOM) del producto
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.use_combo
                          ? "No se enviarán componentes: el backend los autocompletará según la receta configurada del producto."
                          : "Deberá agregar manualmente los componentes y cantidades para este producto."}
                      </p>
                    </div>
                  </div>

                  {/* Componentes manuales del ítem */}
                  {!item.use_combo && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border p-3 rounded-lg bg-background">
                        <div className="md:col-span-2">
                          <AsyncProductPicker
                            key={componentTargetItem === itemIndex ? componentPickerKey : `idle-${itemIndex}`}
                            label="Componente"
                            placeholder="Buscar componente..."
                            defaultLabel={
                              componentTargetItem === itemIndex ? componentDraft.component_name : undefined
                            }
                            additionalParams={{ only_components: 1 }}
                            onSelect={(value, prod) => {
                              setComponentTargetItem(itemIndex);
                              setComponentDraft((prev) => ({
                                ...prev,
                                component_id: value,
                                component_name: prod?.name ?? "",
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Cant. Req.</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={componentTargetItem === itemIndex ? componentDraft.quantity_required : ""}
                            onChange={(e) => {
                              setComponentTargetItem(itemIndex);
                              setComponentDraft((prev) => ({ ...prev, quantity_required: e.target.value }));
                            }}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Costo Unit.</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={componentTargetItem === itemIndex ? componentDraft.unit_cost : ""}
                            onChange={(e) => {
                              setComponentTargetItem(itemIndex);
                              setComponentDraft((prev) => ({ ...prev, unit_cost: e.target.value }));
                            }}
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
                            value={componentTargetItem === itemIndex ? componentDraft.waste_percentage : ""}
                            onChange={(e) => {
                              setComponentTargetItem(itemIndex);
                              setComponentDraft((prev) => ({ ...prev, waste_percentage: e.target.value }));
                            }}
                            placeholder="0"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            setComponentTargetItem(itemIndex);
                            handleAddOrUpdateComponent();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {editingComponentIndex !== null && componentTargetItem === itemIndex
                            ? "Actualizar"
                            : "Agregar"}
                        </Button>
                      </div>

                      {item.components.length > 0 && (
                        <DataTable columns={makeComponentColumns(itemIndex)} data={item.components} />
                      )}
                    </div>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar otro producto
              </Button>

              {form.formState.errors.items && (
                <p className="text-sm text-destructive">
                  {(form.formState.errors.items as any)?.message}
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
