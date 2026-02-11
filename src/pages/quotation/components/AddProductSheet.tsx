import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import { FormInput } from "@/components/FormInput";
import { useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useEffect, useState } from "react";
import { useAllProductPriceCategories } from "@/pages/product-price-category/lib/product-price-category.hook";
import { useProductPrices } from "@/pages/product/lib/product-price.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";

interface AddProductSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (detail: ProductDetail) => void;
  defaultIsIgv?: boolean;
  editingDetail?: ProductDetail | null;
  editIndex?: number | null;
  onEdit?: (detail: ProductDetail, index: number) => void;
  currency: string;
}

export interface ProductDetail {
  product_id: string;
  product_name: string;
  is_igv: boolean;
  quantity: string;
  unit_price: string;
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
  defaultIsIgv = true,
  editingDetail = null,
  editIndex = null,
  onEdit,
  currency,
}: AddProductSheetProps) => {
  const isEditMode = editingDetail !== null && editIndex !== null;

  const form = useForm({
    defaultValues: {
      product_id: "",
      price_category_id: "",
      quantity: "",
      unit_price: "",
      purchase_price: "0",
      description: "",
      is_igv: defaultIsIgv,
    },
  });

  const [calculatedValues, setCalculatedValues] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const [lastSetPrice, setLastSetPrice] = useState<string | null>(null);

  const productId = form.watch("product_id");
  const priceCategoryId = form.watch("price_category_id");
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unit_price");
  const isIgv = form.watch("is_igv");

  // Cargar categorías de precio
  const { data: priceCategories } = useAllProductPriceCategories();

  // Cargar precios del producto seleccionado
  const { data: productPricesData } = useProductPrices({
    productId: parseInt(productId) || 0,
  });

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
          form.setValue("unit_price", priceValue.toString());
          setLastSetPrice(priceValue.toString());
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
        form.reset({
          product_id: editingDetail.product_id,
          price_category_id: "",
          quantity: editingDetail.quantity,
          unit_price: editingDetail.unit_price,
          purchase_price: editingDetail.purchase_price ?? "0",
          description: editingDetail.description || "",
          is_igv: editingDetail.is_igv,
        });
      } else {
        form.reset({
          product_id: "",
          price_category_id: "",
          quantity: "",
          unit_price: "",
          purchase_price: "0",
          description: "",
          is_igv: defaultIsIgv,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset lastSetPrice cuando cambia el producto
  useEffect(() => {
    setLastSetPrice(null);
  }, [productId]);

  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;

    if (qty > 0 && price > 0) {
      if (!isIgv) {
        // El precio NO incluye IGV: calcular el IGV
        const subtotal = qty * price;
        const tax = subtotal * 0.18;
        const total = subtotal + tax;
        setCalculatedValues({ subtotal, tax, total });
      } else {
        // El precio incluye IGV: desglosar el IGV
        const total = qty * price;
        const subtotal = total / 1.18;
        const tax = total - subtotal;
        setCalculatedValues({ subtotal, tax, total });
      }
    } else {
      setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
    }
  }, [quantity, unitPrice, isIgv]);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductResource | null>(null);

  const handleSave = () => {
    const formData = form.getValues();

    if (!formData.product_id || !formData.quantity || !formData.unit_price) {
      return;
    }

    // En modo edición, usar el nombre del editingDetail si no hay selectedProduct
    const productName = selectedProduct?.name ?? editingDetail?.product_name;
    if (!productName) return;

    const detail: ProductDetail = {
      product_id: formData.product_id,
      product_name: productName,
      is_igv: formData.is_igv,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      purchase_price: formData.purchase_price ?? "0",
      description: formData.description || "",
      subtotal: calculatedValues.subtotal,
      tax: calculatedValues.tax,
      total: calculatedValues.total,
      currency: currency,
    };

    if (isEditMode && onEdit && editIndex !== null) {
      onEdit(detail, editIndex);
    } else {
      onAdd(detail);
    }

    form.reset();
    setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={isEditMode ? "Editar Producto" : "Agregar Producto"}
      subtitle="Complete los datos del producto"
      icon="Package"
      size="lg"
    >
      <div className="flex flex-col gap-4">
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
            name="unit_price"
            label="Precio Unitario"
            type="number"
            step="0.0001"
            placeholder="0.00"
          />

          {/* <div className="col-span-2">
            <FormInput
              control={form.control}
              name="purchase_price"
              label="Precio Compra"
              type="number"
              step="0.0001"
              placeholder="0.00"
            />
          </div> */}

          <div className="col-span-2">
            <FormInput
              control={form.control}
              name="description"
              label="Descripción"
              placeholder="Descripción del producto (opcional)"
            />
          </div>
        </div>

        <FormSwitch
          control={form.control}
          name="is_igv"
          negate={true}
          text="Calcular IGV"
          textDescription="Calcular IGV para este producto"
          autoHeight
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
            onClick={handleSave}
            disabled={!productId || !quantity || !unitPrice}
          >
            {isEditMode ? (
              <Pencil className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Actualizar Producto" : "Agregar Producto"}
          </Button>
        </div>
      </div>
    </GeneralSheet>
  );
};
