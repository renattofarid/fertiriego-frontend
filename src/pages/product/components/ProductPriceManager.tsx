import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";
import { useProductPrices } from "../lib/product-price.hook";
import { useProductPriceStore } from "../lib/product-price.store";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllProductPriceCategories } from "@/pages/product-price-category/lib/product-price-category.hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { FormSelect } from "@/components/FormSelect";
import { Plus, Trash2, Pencil, DollarSign } from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import { formatCurrency } from "@/lib/formatCurrency";
import type {
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
  ProductPriceResource,
} from "../lib/product.interface";

interface ProductPriceManagerProps {
  productId: number;
  onPriceChange?: () => void;
}

// Schema de validación para el formulario
const productPriceSchema = z.object({
  product_id: z.number(),
  branch_id: requiredStringId("Debe seleccionar una sucursal"),
  category_id: requiredStringId("Debe seleccionar una categoría de precio"),
  price_soles: z
    .number()
    .min(0, "El precio en soles debe ser mayor o igual a 0"),
  price_usd: z.number().min(0, "El precio en USD debe ser mayor o igual a 0"),
});

type ProductPriceFormData = z.infer<typeof productPriceSchema>;

export function ProductPriceManager({
  productId,
  onPriceChange,
}: ProductPriceManagerProps) {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ProductPriceResource | null>(
    null
  );
  const [deletePriceId, setDeletePriceId] = useState<number | null>(null);

  // Configuración del formulario con react-hook-form
  const form = useForm<ProductPriceFormData>({
    resolver: zodResolver(productPriceSchema),
    defaultValues: {
      product_id: productId,
      branch_id: "",
      category_id: "",
      price_soles: 0,
      price_usd: 0,
    },
  });

  const { data: productPrices, refetch } = useProductPrices({
    productId,
  });

  const { data: branches } = useAllBranches();
  const { data: priceCategories } = useAllProductPriceCategories();

  const {
    createProductPrice,
    updateProductPrice,
    deleteProductPrice,
    isSubmitting,
  } = useProductPriceStore();

  const handleSubmit = async (data: ProductPriceFormData) => {
    try {
      if (editingPrice) {
        await updateProductPrice(editingPrice.id, {
          branch_id: parseInt(data.branch_id),
          category_id: parseInt(data.category_id),
          price_soles: data.price_soles,
          price_usd: data.price_usd,
        } as UpdateProductPriceRequest);
        successToast("Precio actualizado exitosamente");
      } else {
        await createProductPrice({
          ...data,
          branch_id: parseInt(data.branch_id),
          category_id: parseInt(data.category_id),
        } as CreateProductPriceRequest);
        successToast("Precio creado exitosamente");
      }

      setShowPriceForm(false);
      setEditingPrice(null);
      resetForm();
      refetch();
      onPriceChange?.();
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        `Error al ${editingPrice ? "actualizar" : "crear"} el precio`;
      errorToast(errorMessage);
    }
  };

  const handleEdit = (price: ProductPriceResource) => {
    setEditingPrice(price);
    form.reset({
      product_id: productId,
      branch_id: price.branch_id.toString(),
      category_id: price.category_id.toString(),
      price_soles: price.price_soles ?? 0,
      price_usd: price.price_usd ?? 0,
    });
    setShowPriceForm(true);
  };

  const handleDelete = async () => {
    if (!deletePriceId) return;
    try {
      await deleteProductPrice(deletePriceId);
      successToast("Precio eliminado exitosamente");
      refetch();
      onPriceChange?.();
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al eliminar el precio";
      errorToast(errorMessage);
    } finally {
      setDeletePriceId(null);
    }
  };

  const resetForm = () => {
    form.reset({
      product_id: productId,
      branch_id: "",
      category_id: "",
      price_soles: 0,
      price_usd: 0,
    });
  };

  const handleCancel = () => {
    setShowPriceForm(false);
    setEditingPrice(null);
    resetForm();
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    return formatCurrency(numPrice, { currencySymbol: currency, decimals: 2 });
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {productPrices?.length || 0} precio(s) configurado(s)
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPriceForm(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Agregar Precio</span>
        </Button>
      </div>

      {/* Prices List */}
      {productPrices && productPrices.length > 0 ? (
        <div className="space-y-3 w-full max-w-full">
          {productPrices.map((price) => (
            <Card key={price.id} className="p-3 sm:p-4 overflow-hidden">
              <div className="flex flex-col gap-3">
                {/* Header de la card - Información principal */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Nombre de sucursal y categoría */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h4 className="font-medium text-sm sm:text-base truncate min-w-0 max-w-full">
                        {branches?.find((b) => b.id === price.branch_id)?.name || "N/A"}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md border shrink-0 w-fit`}
                      >
                        {priceCategories?.find((c) => c.id === price.category_id)?.name || "N/A"}
                      </span>
                    </div>

                    {/* Precios y fecha */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 min-w-0 flex-1">
                        <span className="font-medium text-foreground truncate">
                          {formatPrice((price.price_soles ?? 0).toString(), "S/.")}
                        </span>
                        <span className="font-medium text-foreground truncate">
                          {formatPrice((price.price_usd ?? 0).toString(), "$")}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(price.created_at).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(price)}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletePriceId(price.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DollarSign />
            </EmptyMedia>
            <EmptyTitle>No hay precios configurados</EmptyTitle>
            <EmptyDescription>
              Configura los precios para este producto por sucursal y categoría
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPriceForm(true)}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Agregar primer precio
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {/* Price Form Modal */}
      {showPriceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {editingPrice ? "Editar Precio" : "Agregar Nuevo Precio"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormSelect
                    control={form.control}
                    name="branch_id"
                    label="Sucursal"
                    placeholder="Seleccionar sucursal"
                    options={
                      branches?.map((branch) => ({
                        value: branch.id.toString(),
                        label: branch.name,
                      })) || []
                    }
                  />

                  <FormSelect
                    control={form.control}
                    name="category_id"
                    label="Categoría de Precio"
                    placeholder="Seleccionar categoría"
                    options={
                      priceCategories?.map((category) => ({
                        value: category.id.toString(),
                        label: category.name,
                      })) || []
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price_soles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio en Soles</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price_usd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio en USD</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

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
                      <DollarSign className="h-4 w-4" />
                      {isSubmitting
                        ? editingPrice
                          ? "Actualizando..."
                          : "Creando..."
                        : editingPrice
                        ? "Actualizar"
                        : "Crear"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Dialog */}
      {deletePriceId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeletePriceId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
