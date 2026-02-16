import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { FormInput } from "@/components/FormInput";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Save } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useEffect, useState } from "react";
import { useAllProductPriceCategories } from "@/pages/product-price-category/lib/product-price-category.hook";
import { useProductPrices } from "@/pages/product/lib/product-price.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { GeneralModal } from "@/components/GeneralModal";
import { ProductForm } from "@/pages/product/components/ProductForm";
import { useProductStore } from "@/pages/product/lib/product.store";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { successToast, errorToast } from "@/lib/core.function";
import { useQueryClient } from "@tanstack/react-query";
import { PRODUCT } from "@/pages/product/lib/product.interface";

interface AddProductSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (detail: ProductDetail) => void;
  editingDetail?: ProductDetail | null;
  editingIndex?: number;
  onEdit?: (detail: ProductDetail, index: number) => void;
  currency?: string;
}

export interface ProductDetail {
  product_id: string;
  product_name: string;
  is_igv: boolean;
  quantity: string;
  unit_price: string; // Este será el valor unitario (sin IGV)
  purchase_price: string;
  description?: string;
  subtotal: number;
  tax: number;
  total: number;
  currency?: string;
}

export const AddProductSheet = ({
  open,
  onClose,
  onAdd,
  editingDetail = null,
  editingIndex,
  onEdit,
  currency = "PEN",
}: AddProductSheetProps) => {
  const isEditMode = editingDetail !== null;
  const form = useForm({
    defaultValues: {
      product_id: "",
      price_category_id: "",
      quantity: "",
      unit_value: "", // Valor unitario (sin IGV)
      unit_price: "", // Precio unitario (con IGV)
      purchase_price: "0",
      description: "",
    },
  });

  const [calculatedValues, setCalculatedValues] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const [lastSetPrice, setLastSetPrice] = useState<string | null>(null);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResource | null>(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);

  // Hooks para crear producto
  const { createProduct, isSubmitting: isCreatingProduct } = useProductStore();
  const { data: units } = useAllUnits();
  const queryClient = useQueryClient();

  const productId = form.watch("product_id");
  const priceCategoryId = form.watch("price_category_id");
  const quantity = form.watch("quantity");
  const unitValue = form.watch("unit_value");
  const unitPrice = form.watch("unit_price");

  // Cargar categorías de precio
  const { data: priceCategories } = useAllProductPriceCategories();

  // Cargar precios del producto seleccionado
  const { data: productPricesData } = useProductPrices({
    productId: parseInt(productId) || 0,
  });

  // Función para formatear número sin ceros innecesarios
  const formatNumber = (num: number): string => {
    // Redondear a 4 decimales pero eliminar ceros trailing
    return parseFloat(num.toFixed(4)).toString();
  };

  // Sincronizar unit_value y unit_price
  useEffect(() => {
    if (isUpdatingPrice) return;

    const value = parseFloat(unitValue);
    if (!isNaN(value) && value > 0) {
      setIsUpdatingPrice(true);
      const price = value * 1.18;
      form.setValue("unit_price", formatNumber(price));
      setIsUpdatingPrice(false);
    } else if (unitValue === "") {
      form.setValue("unit_price", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitValue]);

  useEffect(() => {
    if (isUpdatingPrice) return;

    const price = parseFloat(unitPrice);
    if (!isNaN(price) && price > 0) {
      setIsUpdatingPrice(true);
      const value = price / 1.18;
      form.setValue("unit_value", formatNumber(value));
      setIsUpdatingPrice(false);
    } else if (unitPrice === "") {
      form.setValue("unit_value", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitPrice]);

  // Autocompletar precio cuando se selecciona categoría de precio o moneda
  useEffect(() => {
    if (priceCategoryId && productPricesData && currency) {
      const selectedPrice = productPricesData.find(
        (price) => price.category_id === parseInt(priceCategoryId),
      );

      if (selectedPrice) {
        let priceValue: number = 0;

        // Seleccionar el precio según la moneda (usar 0 si no existe)
        if (selectedPrice.prices) {
          priceValue = selectedPrice.prices[currency] ?? 0;
        }

        if (priceValue.toString() !== lastSetPrice) {
          // Asumimos que el precio de la categoría es con IGV
          setIsUpdatingPrice(true);
          form.setValue("unit_price", formatNumber(priceValue));
          const value = priceValue / 1.18;
          form.setValue("unit_value", formatNumber(value));
          setLastSetPrice(priceValue.toString());
          setIsUpdatingPrice(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceCategoryId, currency, productPricesData]);

  // Cargar datos cuando se abre el sheet
  useEffect(() => {
    if (open) {
      // Reset lastSetPrice cuando se abre el sheet
      setLastSetPrice(null);

      if (editingDetail) {
        const value = parseFloat(editingDetail.unit_price);
        const price = value * 1.18;

        form.reset({
          product_id: editingDetail.product_id,
          price_category_id: "",
          quantity: editingDetail.quantity,
          unit_value: editingDetail.unit_price, // El unit_price guardado es el valor unitario
          unit_price: formatNumber(price),
          purchase_price: editingDetail.purchase_price ?? "0",
          description: editingDetail.description || "",
        });
      } else {
        form.reset({
          product_id: "",
          price_category_id: "",
          quantity: "",
          unit_value: "",
          unit_price: "",
          purchase_price: "0",
          description: "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset lastSetPrice cuando cambia el producto
  useEffect(() => {
    setLastSetPrice(null);
  }, [productId]);

  // Calcular valores (subtotal, tax, total) usando el valor unitario
  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const value = parseFloat(unitValue) || 0;

    if (qty > 0 && value > 0) {
      // El valor unitario NO incluye IGV, calculamos el total con IGV
      const subtotal = qty * value;
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      setCalculatedValues({ subtotal, tax, total });
    } else {
      setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
    }
  }, [quantity, unitValue]);

  const handleAdd = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    const formData = form.getValues();

    if (!formData.product_id || !formData.quantity || !formData.unit_value) {
      return;
    }

    // En modo edición, usar el nombre del editingDetail si no hay selectedProduct
    const productName = selectedProduct?.name ?? editingDetail?.product_name;
    if (!productName) return;

    const detail: ProductDetail = {
      product_id: formData.product_id,
      product_name: productName,
      is_igv: false, // false porque guardamos el valor sin IGV
      quantity: formData.quantity,
      unit_price: formData.unit_value, // Guardamos el valor unitario (sin IGV)
      purchase_price: formData.purchase_price ?? "0",
      description: formData.description || "",
      subtotal: calculatedValues.subtotal,
      tax: calculatedValues.tax,
      total: calculatedValues.total,
      currency: currency,
    };

    if (isEditMode && onEdit && editingIndex !== undefined) {
      onEdit(detail, editingIndex);
      // En modo edición, cerrar el modal después de actualizar
      onClose();
    } else {
      onAdd(detail);
      // En modo agregar, limpiar el formulario pero mantener el modal abierto
      form.reset({
        product_id: "",
        price_category_id: "",
        quantity: "",
        unit_value: "",
        unit_price: "",
        purchase_price: "0",
        description: "",
      });
      setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
      setSelectedProduct(null);
    }
  };

  const handleCreateProduct = async (data: any) => {
    try {
      await createProduct(data);
      successToast("Producto creado exitosamente");
      // Invalidar el cache de react-query para refrescar la lista
      await queryClient.invalidateQueries({ queryKey: [PRODUCT.QUERY_KEY] });
      setShowCreateProductModal(false);
    } catch (error) {
      errorToast("Error al crear el producto");
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={isEditMode ? "Editar Producto" : "Agregar Producto"}
      subtitle="Complete los datos del producto"
      icon="Package"
      size="xl"
      modal={false}
      preventAutoClose={!isEditMode}
    >
      <div className="flex flex-col gap-4 px-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto"
              useQueryHook={useProduct}
              mapOptionFn={(product: ProductResource) => ({
                value: product.id.toString(),
                label: product.name,
                description: product.category_name,
              })}
              placeholder="Seleccionar producto"
              onValueChange={(_value, item) => {
                setSelectedProduct(item ?? null);
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setShowCreateProductModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {productId && (
          <>
            {priceCategories && priceCategories.length > 0 && (
              <FormSelect
                control={form.control}
                name="price_category_id"
                label="Categoría de Precio"
                options={priceCategories.map((cat) => ({
                  value: cat.id.toString(),
                  label: cat.name,
                }))}
                placeholder="Seleccionar categoría de precio (opcional)"
              />
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="quantity"
            label="Cantidad"
            type="number"
            step="0.0001"
            placeholder="0.00"
          />

          <FormInput
            control={form.control}
            name="purchase_price"
            label="Precio Compra"
            type="number"
            step="0.0001"
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="unit_value"
            label="Valor Unitario (sin IGV)"
            type="number"
            step="0.0001"
            placeholder="0.00"
          />

          <div className="col-span-1">
            <FormInput
              control={form.control}
              name="unit_price"
              label="Precio Unitario (con IGV)"
              type="number"
              step="0.0001"
              placeholder="0.00"
            />
          </div>
        </div>

        <FormInput
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Descripción del producto (opcional)"
        />

        {calculatedValues.total > 0 && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "S/"}{" "}
                {calculatedValues.subtotal.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IGV (18%):</span>
              <span className="font-medium">
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "S/"}{" "}
                {calculatedValues.tax.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total:</span>
              <span>
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "S/"}{" "}
                {calculatedValues.total.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!productId || !quantity || !unitValue}
          >
            {isEditMode ? (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Actualizar Producto
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal para crear producto */}
      {showCreateProductModal && units && (
        <GeneralModal
          open={showCreateProductModal}
          onClose={() => setShowCreateProductModal(false)}
          title="Crear Nuevo Producto"
          subtitle="Complete los datos del nuevo producto"
          icon="Package"
          size="3xl"
        >
          <div
            onSubmit={(e) => {
              e.stopPropagation();
            }}
          >
            <ProductForm
              defaultValues={{
                name: "",
                category_id: "",
                brand_id: "",
                unit_id: "",
                product_type_id: "",
                is_igv: false,
                observations: "",
                technical_sheet: [],
              }}
              onSubmit={handleCreateProduct}
              onCancel={() => setShowCreateProductModal(false)}
              isSubmitting={isCreatingProduct}
              mode="create"
              units={units}
            />
          </div>
        </GeneralModal>
      )}
    </GeneralSheet>
  );
};
