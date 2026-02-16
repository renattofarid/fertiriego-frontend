import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { warehouseDocumentSchemaCreate } from "../lib/warehouse-document.schema";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DOCUMENT_TYPES } from "../lib/warehouse-document.constants";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { Plus, Trash2, FileText, Package, Pencil } from "lucide-react";
import { useProduct } from "@/pages/product/lib/product.hook";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { toast } from "sonner";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import { FormInput } from "@/components/FormInput";

interface WarehouseDocumentFormProps {
  onSubmit: (data: WarehouseDocumentSchema) => void;
  defaultValues?: Partial<WarehouseDocumentSchema>;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  warehouses: WarehouseResource[];
}

// Tipo para las filas de detalle
type DetailRow = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total: number;
  observations: string;
};

export default function WarehouseDocumentForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode,
  warehouses,
}: WarehouseDocumentFormProps) {
  const { data: productsData } = useProduct();
  const products: ProductResource[] = productsData?.data ?? [];

  const form = useForm({
    resolver: zodResolver(warehouseDocumentSchemaCreate) as any,
    defaultValues: defaultValues || {
      warehouse_id: "",
      document_type: "",
      document_number: "",
      person_id: "",
      document_date: "",
      observations: "",
      details: [],
    },
  });

  // Estado para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [currentDetail, setCurrentDetail] = useState<Partial<DetailRow>>({
    product_id: "",
    quantity: 0,
    unit_cost: 0,
    observations: "",
  });
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );

  // Cargar detalles iniciales cuando hay defaultValues
  useEffect(() => {
    if (defaultValues?.details && defaultValues.details.length > 0) {
      const mappedDetails: DetailRow[] = defaultValues.details.map((d) => ({
        product_id: d.product_id,
        product_name:
          products.find((p) => p.id.toString() === d.product_id)?.name ||
          "Producto desconocido",
        quantity: Number(d.quantity) || 0,
        unit_cost: Number(d.unit_cost) || 0,
        total: (Number(d.quantity) || 0) * (Number(d.unit_cost) || 0),
        observations: d.observations || "",
      }));
      setDetails(mappedDetails);
    }
  }, [defaultValues, products]);

  // Agregar/Actualizar detalle
  const handleAddOrUpdateDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      currentDetail.unit_cost === undefined
    ) {
      toast.error("Complete los campos del producto");
      return;
    }

    const product = products.find(
      (p) => p.id.toString() === currentDetail.product_id,
    );
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    const newDetail: DetailRow = {
      product_id: currentDetail.product_id,
      product_name: product.name,
      quantity: currentDetail.quantity,
      unit_cost: currentDetail.unit_cost,
      total: currentDetail.quantity * currentDetail.unit_cost,
      observations: currentDetail.observations || "",
    };

    if (editingDetailIndex !== null) {
      const updated = [...details];
      updated[editingDetailIndex] = newDetail;
      setDetails(updated);
      setEditingDetailIndex(null);
      toast.success("Producto actualizado");
    } else {
      setDetails([...details, newDetail]);
      toast.success("Producto agregado");
    }

    setCurrentDetail({
      product_id: "",
      quantity: 0,
      unit_cost: 0,
      observations: "",
    });
  };

  // Editar detalle
  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setCurrentDetail({
      product_id: detail.product_id,
      quantity: detail.quantity,
      unit_cost: detail.unit_cost,
      observations: detail.observations,
    });
    setEditingDetailIndex(index);
  };

  // Eliminar detalle
  const handleDeleteDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
    toast.success("Producto eliminado");
  };

  // Sincronizar details con form
  useEffect(() => {
    const formatted = details.map((d) => ({
      product_id: d.product_id,
      quantity: d.quantity,
      unit_cost: d.unit_cost,
      observations: d.observations,
    }));
    form.setValue("details", formatted);
  }, [details, form]);

  // Calcular totales
  const subtotal = details.reduce((sum, d) => sum + d.total, 0);

  // Columnas para DataTable
  const createDetailColumns = (
    onEdit: (index: number) => void,
    onDelete: (index: number) => void,
  ): ColumnDef<DetailRow>[] => [
    {
      accessorKey: "product_name",
      header: "Producto",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.product_name}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => <span>{row.original.quantity.toFixed(2)}</span>,
    },
    {
      accessorKey: "unit_cost",
      header: "Costo Unit.",
      cell: ({ row }) => <span>S/ {row.original.unit_cost.toFixed(2)}</span>,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold">
          S/ {row.original.total.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "observations",
      header: "Observaciones",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.observations || "-"}
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
      toast.error("Debe agregar al menos un producto");
      return;
    }

    const payload = {
      ...values,
      details: details.map((d) => ({
        product_id: d.product_id,
        quantity: d.quantity,
        unit_cost: d.unit_cost,
        observations: d.observations,
      })),
    };

    onSubmit(payload as WarehouseDocumentSchema);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Información del Documento */}
        <GroupFormSection
          icon={FileText}
          title="Información del Documento"
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="warehouse_id"
            label="Almacén"
            placeholder="Seleccione un almacén"
            options={warehouses.map((w) => ({
              value: w.id.toString(),
              label: w.name,
            }))}
          />

          <FormSelect
            control={form.control}
            name="document_type"
            label="Tipo de Documento"
            placeholder="Seleccione el tipo"
            options={DOCUMENT_TYPES.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
          />

          <FormInput
            control={form.control}
            name="document_number"
            label="Número de Documento"
            placeholder="Ej: AJ-000123"
            uppercase
          />

          <FormSelectAsync
            control={form.control}
            name="person_id"
            label="Persona Responsable"
            placeholder="Seleccione una persona"
            useQueryHook={useWorkers}
            mapOptionFn={(person: PersonResource) => ({
              value: person.id.toString(),
              label: `${person.names} ${person.father_surname ?? ""} ${
                person.mother_surname ?? ""
              }`.trim(),
            })}
          />

          <DatePickerFormField
            control={form.control}
            name="document_date"
            label="Fecha del Documento"
            dateFormat="dd/MM/yyyy"
            placeholder="Seleccione la fecha"
            disabledRange={{
              after: new Date(),
            }}
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem className="md:col-span-2 lg:col-span-3">
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales"
                    className="resize-none"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Detalles del Documento */}
        <GroupFormSection
          icon={Package}
          title="Detalles del Documento"
          cols={{ sm: 1 }}
        >
          <div className="space-y-4">
            {/* Formulario inline para agregar/editar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border p-3 rounded-lg bg-muted/30">
              <div className="md:col-span-5">
                <SearchableSelectAsync
                  label="Producto"
                  useQueryHook={useProduct}
                  mapOptionFn={(product) => ({
                    value: product.id.toString(),
                    label: product.name,
                    description: product.unit_name,
                  })}
                  value={currentDetail.product_id || ""}
                  onChange={(value) =>
                    setCurrentDetail({
                      ...currentDetail,
                      product_id: value,
                    })
                  }
                  withValue
                  placeholder="Buscar producto..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Cantidad</label>
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

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Costo Unit.</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentDetail.unit_cost || ""}
                  onChange={(e) =>
                    setCurrentDetail({
                      ...currentDetail,
                      unit_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Observaciones</label>
                <Input
                  value={currentDetail.observations || ""}
                  onChange={(e) =>
                    setCurrentDetail({
                      ...currentDetail,
                      observations: e.target.value,
                    })
                  }
                  placeholder="Notas..."
                />
              </div>

              <div className="md:col-span-1">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAddOrUpdateDetail}
                  className="w-full h-10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {editingDetailIndex !== null ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </div>

            {/* Tabla de productos agregados */}
            {details.length > 0 ? (
              <>
                <DataTable columns={detailColumns} data={details} />

                {/* Resumen de totales */}
                <div className="flex justify-end">
                  <div className="w-full md:w-1/3 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Subtotal:</span>
                      <span>S/ {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay productos agregados. Complete el formulario y haga clic
                en "Agregar".
              </div>
            )}
          </div>
        </GroupFormSection>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear Documento"
                : "Actualizar Documento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
