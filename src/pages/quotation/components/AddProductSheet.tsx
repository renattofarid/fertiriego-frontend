import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import { FormInput } from "@/components/FormInput";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useEffect, useState } from "react";
import { useAllProductPriceCategories } from "@/pages/product-price-category/lib/product-price-category.hook";
import { useProductPrices } from "@/pages/product/lib/product-price.hook";

interface AddProductSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (detail: ProductDetail) => void;
  products: ProductResource[];
  defaultIsIgv?: boolean;
  editingDetail?: ProductDetail | null;
  editIndex?: number | null;
  onEdit?: (detail: ProductDetail, index: number) => void;
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
}

export const AddProductSheet = ({
  open,
  onClose,
  onAdd,
  products,
  defaultIsIgv = true,
  editingDetail = null,
  editIndex = null,
  onEdit,
}: AddProductSheetProps) => {
  console.log('[AddProductSheet] Component render:', {
    open,
    defaultIsIgv,
    editingDetail,
    editIndex,
    productsCount: products.length
  });

  const isEditMode = editingDetail !== null && editIndex !== null;

  const form = useForm({
    defaultValues: {
      product_id: "",
      price_category_id: "",
      quantity: "",
      unit_price: "",
      purchase_price: "",
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

  // Autocompletar precio cuando se selecciona categoría de precio
  useEffect(() => {
    console.log('[AddProductSheet] Price category effect triggered:', {
      priceCategoryId,
      hasData: !!productPricesData?.data,
      dataLength: productPricesData?.data?.length,
      allPrices: productPricesData?.data,
      lastSetPrice
    });

    if (priceCategoryId && productPricesData?.data) {
      const selectedPrice = productPricesData.data.find(
        (price) => price.category_id === parseInt(priceCategoryId)
      );

      console.log('[AddProductSheet] Selected price:', {
        priceCategoryId,
        selectedPrice,
        willSetValue: !!selectedPrice,
        priceValue: selectedPrice?.price_soles,
        lastSetPrice,
        shouldUpdate: selectedPrice && selectedPrice.price_soles !== lastSetPrice
      });

      if (selectedPrice && selectedPrice.price_soles !== lastSetPrice) {
        // Asumimos que usamos price_soles por defecto
        console.log('[AddProductSheet] Setting unit_price to:', selectedPrice.price_soles);
        form.setValue("unit_price", selectedPrice.price_soles);
        setLastSetPrice(selectedPrice.price_soles);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceCategoryId, productPricesData]);

  // Cargar datos cuando se abre el sheet
  useEffect(() => {
    console.log('[AddProductSheet] Open effect triggered:', {
      open,
      isEditMode,
      editingDetail,
      defaultIsIgv
    });

    if (open) {
      // Reset lastSetPrice cuando se abre el sheet
      setLastSetPrice(null);

      if (editingDetail) {
        console.log('[AddProductSheet] Resetting form with editing detail');
        form.reset({
          product_id: editingDetail.product_id,
          price_category_id: "",
          quantity: editingDetail.quantity,
          unit_price: editingDetail.unit_price,
          purchase_price: editingDetail.purchase_price,
          description: editingDetail.description || "",
          is_igv: editingDetail.is_igv,
        });
      } else {
        console.log('[AddProductSheet] Resetting form to defaults');
        form.reset({
          product_id: "",
          price_category_id: "",
          quantity: "",
          unit_price: "",
          purchase_price: "",
          description: "",
          is_igv: defaultIsIgv,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset lastSetPrice cuando cambia el producto
  useEffect(() => {
    console.log('[AddProductSheet] Product changed, resetting lastSetPrice');
    setLastSetPrice(null);
  }, [productId]);

  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;

    console.log('[AddProductSheet] Calculation effect triggered:', {
      quantity,
      unitPrice,
      isIgv,
      qty,
      price
    });

    if (qty > 0 && price > 0) {
      if (isIgv) {
        // El precio incluye IGV: desglosar el IGV
        const total = qty * price;
        const subtotal = total / 1.18;
        const tax = total - subtotal;
        console.log('[AddProductSheet] Calculated with IGV:', { subtotal, tax, total });
        setCalculatedValues({ subtotal, tax, total });
      } else {
        // El precio NO incluye IGV: calcular el IGV
        const subtotal = qty * price;
        const tax = subtotal * 0.18;
        const total = subtotal + tax;
        console.log('[AddProductSheet] Calculated without IGV:', { subtotal, tax, total });
        setCalculatedValues({ subtotal, tax, total });
      }
    } else {
      console.log('[AddProductSheet] Resetting calculated values to 0');
      setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
    }
  }, [quantity, unitPrice, isIgv]);

  const handleSave = () => {
    const formData = form.getValues();

    if (!formData.product_id || !formData.quantity || !formData.unit_price) {
      return;
    }

    const product = products.find(
      (p) => p.id === parseInt(formData.product_id)
    );

    if (!product) return;

    const detail: ProductDetail = {
      product_id: formData.product_id,
      product_name: product.name,
      is_igv: formData.is_igv,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      purchase_price: formData.purchase_price,
      description: formData.description || "",
      subtotal: calculatedValues.subtotal,
      tax: calculatedValues.tax,
      total: calculatedValues.total,
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
      <div className="flex flex-col gap-4 px-4">
        <FormSelect
          control={form.control}
          name="product_id"
          label="Producto"
          options={products.map((p) => ({
            value: p.id.toString(),
            label: p.name,
          }))}
          placeholder="Seleccionar producto"
        />

        {productId && priceCategories && priceCategories.length > 0 && (
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

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="quantity"
            label="Cantidad"
            type="number"
            step="0.01"
            placeholder="0.00"
          />

          <FormInput
            control={form.control}
            name="unit_price"
            label="Precio Unitario"
            type="number"
            step="0.01"
            placeholder="0.00"
          />

          <div className="col-span-2">
            <FormInput
              control={form.control}
              name="purchase_price"
              label="Precio Compra"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </div>

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
          text="Incluye IGV"
          textDescription="El precio unitario incluye el IGV"
        />

        {calculatedValues.total > 0 && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">
                S/. {calculatedValues.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IGV (18%):</span>
              <span className="font-medium">
                S/. {calculatedValues.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total:</span>
              <span>S/. {calculatedValues.total.toFixed(2)}</span>
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
            <Plus className="h-4 w-4 mr-2" />
            {isEditMode ? "Actualizar Producto" : "Agregar Producto"}
          </Button>
        </div>
      </div>
    </GeneralSheet>
  );
};
