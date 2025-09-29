import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProductComponents } from "../lib/product-component.hook";
import { useProductComponentStore } from "../lib/product-component.store";
import { useAllProducts } from "../lib/product.hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { FormSelect } from "@/components/FormSelect";
import { Plus, Trash2, Edit, Package, Hash } from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import type {
  CreateProductComponentRequest,
  UpdateProductComponentRequest,
  ProductComponentResource,
} from "../lib/product.interface";

interface ProductComponentManagerProps {
  productId: number;
  onComponentChange?: () => void;
}

// Schema de validación para el formulario
const productComponentSchema = z.object({
  product_id: z.number(),
  component_id: z.string().min(1, "Debe seleccionar un componente"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
});

type ProductComponentFormData = z.infer<typeof productComponentSchema>;

export function ProductComponentManager({
  productId,
  onComponentChange,
}: ProductComponentManagerProps) {
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ProductComponentResource | null>(
    null
  );
  const [deleteComponentId, setDeleteComponentId] = useState<number | null>(null);

  // Configuración del formulario con react-hook-form
  const form = useForm<ProductComponentFormData>({
    resolver: zodResolver(productComponentSchema),
    defaultValues: {
      product_id: productId,
      component_id: "",
      quantity: 1,
    },
  });

  const { data: productComponents, refetch } = useProductComponents({
    productId,
    params: {},
  });

  const { data: allProducts } = useAllProducts();

  const {
    createProductComponent,
    updateProductComponent,
    deleteProductComponent,
    isSubmitting,
  } = useProductComponentStore();

  // Filter out the current product from the component selection
  const availableComponents = allProducts?.filter(product => product.id !== productId) || [];

  const handleSubmit = async (data: ProductComponentFormData) => {
    try {
      if (editingComponent) {
        await updateProductComponent(editingComponent.id, {
          component_id: parseInt(data.component_id),
          quantity: data.quantity,
        } as UpdateProductComponentRequest);
        successToast("Componente actualizado exitosamente");
      } else {
        await createProductComponent({
          ...data,
          component_id: parseInt(data.component_id),
        } as CreateProductComponentRequest);
        successToast("Componente agregado exitosamente");
      }

      setShowComponentForm(false);
      setEditingComponent(null);
      resetForm();
      refetch();
      onComponentChange?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Error al ${editingComponent ? "actualizar" : "agregar"} el componente`;
      errorToast(errorMessage);
    }
  };

  const handleEdit = (component: ProductComponentResource) => {
    setEditingComponent(component);
    form.reset({
      product_id: productId,
      component_id: component.component_id.toString(),
      quantity: component.quantity,
    });
    setShowComponentForm(true);
  };

  const handleDelete = async () => {
    if (!deleteComponentId) return;
    try {
      await deleteProductComponent(deleteComponentId);
      successToast("Componente eliminado exitosamente");
      refetch();
      onComponentChange?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar el componente";
      errorToast(errorMessage);
    } finally {
      setDeleteComponentId(null);
    }
  };

  const resetForm = () => {
    form.reset({
      product_id: productId,
      component_id: "",
      quantity: 1,
    });
  };

  const handleCancel = () => {
    setShowComponentForm(false);
    setEditingComponent(null);
    resetForm();
  };

  const getComponentName = (componentId: number) => {
    const component = availableComponents.find(p => p.id === componentId);
    return component?.name || `Componente ${componentId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {productComponents?.data.length || 0} componente(s) configurado(s)
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComponentForm(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Agregar Componente</span>
        </Button>
      </div>

      {/* Components List */}
      {productComponents?.data && productComponents.data.length > 0 ? (
        <div className="grid gap-3">
          {productComponents.data.map((component) => (
            <Card key={component.id} className="p-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {component.component_name || getComponentName(component.component_id)}
                      </h4>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs w-fit">
                        <Hash className="h-3 w-3" />
                        <span>ID: {component.component_id}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Cantidad: {component.quantity}
                      </span>
                      <span className="text-xs">
                        {new Date(component.created_at).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(component)}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sm:inline">Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteComponentId(component.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8 border-2 border-dashed border-muted rounded-xl px-4">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            No hay componentes configurados
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            Agrega componentes para crear un producto compuesto
          </p>
          <Button
            variant="outline"
            onClick={() => setShowComponentForm(true)}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar primer componente</span>
          </Button>
        </div>
      )}

      {/* Component Form Modal */}
      {showComponentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {editingComponent ? "Editar Componente" : "Agregar Nuevo Componente"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormSelect
                    control={form.control}
                    name="component_id"
                    label="Componente"
                    placeholder="Seleccionar componente"
                    options={availableComponents.map((product) => ({
                      value: product.id.toString(),
                      label: `${product.name} (ID: ${product.id})`,
                    }))}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Package className="h-4 w-4" />
                      {isSubmitting
                        ? editingComponent
                          ? "Actualizando..."
                          : "Agregando..."
                        : editingComponent
                        ? "Actualizar"
                        : "Agregar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteComponentId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteComponentId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}