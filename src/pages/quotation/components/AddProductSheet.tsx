import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { FormInput } from "@/components/FormInput";
import { FormSwitch } from "@/components/FormSwitch";
import { useForm } from "react-hook-form";
import { Pencil, Plus, History, Package } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useEffect, useState } from "react";
import { useAllProductPriceCategories } from "@/pages/product-price-category/lib/product-price-category.hook";
import { useProductPrices } from "@/pages/product/lib/product-price.hook";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import { ProductHistoryDialog } from "./ProductHistoryDialog";
import { ProductStockDialog } from "./ProductStockDialog";
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
  editIndex?: number | null;
  onEdit?: (detail: ProductDetail, index: number) => void;
  currency: string;
  customerId?: number;
}

export interface ProductDetail {
  product_id: string;
  product_name: string;
  is_igv: boolean;
  quantity: string;
  // Cuando is_igv=true: precio con IGV. Cuando is_igv=false: valor sin IGV.
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
  editingDetail = null,
  editIndex = null,
  onEdit,
  currency,
  customerId,
}: AddProductSheetProps) => {
  const isEditMode = editingDetail !== null && editIndex !== null;

  const form = useForm({
    defaultValues: {
      product_id: "",
      price_category_id: "",
      is_igv: false,
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

  const productId = form.watch("product_id");
  const priceCategoryId = form.watch("price_category_id");
  const isIgv = form.watch("is_igv");
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

        if (selectedPrice.prices) {
          priceValue = selectedPrice.prices[currency] ?? 0;
        }

        if (priceValue.toString() !== lastSetPrice) {
          // El precio de la categoría es con IGV
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
      setLastSetPrice(null);

      if (editingDetail) {
        const isIgvValue = editingDetail.is_igv;
        let unitValueField: string;
        let unitPriceField: string;

        if (isIgvValue) {
          // unit_price guardado = precio con IGV
          unitPriceField = editingDetail.unit_price;
          unitValueField = formatNumber(
            parseFloat(editingDetail.unit_price) / 1.18,
          );
        } else {
          // unit_price guardado = valor sin IGV
          unitValueField = editingDetail.unit_price;
          unitPriceField = formatNumber(
            parseFloat(editingDetail.unit_price) * 1.18,
          );
        }

        form.reset({
          product_id: editingDetail.product_id,
          price_category_id: "",
          is_igv: isIgvValue,
          quantity: editingDetail.quantity,
          unit_value: unitValueField,
          unit_price: unitPriceField,
          purchase_price: editingDetail.purchase_price ?? "0",
          description: editingDetail.description || "",
        });
      } else {
        form.reset({
          product_id: "",
          price_category_id: "",
          is_igv: false,
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

  // Calcular valores (subtotal, tax, total) siempre usando el valor sin IGV
  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const value = parseFloat(unitValue) || 0;

    if (qty > 0 && value > 0) {
      const subtotal = qty * value;
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      setCalculatedValues({ subtotal, tax, total });
    } else {
      setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
    }
  }, [quantity, unitValue]);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductResource | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);

  // Hooks para crear producto
  const { createProduct, isSubmitting: isCreatingProduct } = useProductStore();
  const { data: units } = useAllUnits();
  const queryClient = useQueryClient();

  const handleSave = () => {
    const formData = form.getValues();

    if (!formData.product_id || !formData.quantity || !formData.unit_value) {
      return;
    }

    const productName = selectedProduct?.name ?? editingDetail?.product_name;
    if (!productName) return;

    // is_igv=true → se manda el precio con IGV (unit_price)
    // is_igv=false → se manda el valor sin IGV (unit_value)
    const sentUnitPrice = formData.is_igv
      ? formData.unit_price
      : formData.unit_value;

    const detail: ProductDetail = {
      product_id: formData.product_id,
      product_name: productName,
      is_igv: formData.is_igv,
      quantity: formData.quantity,
      unit_price: sentUnitPrice,
      purchase_price: formData.purchase_price ?? "0",
      description: formData.description || "",
      subtotal: calculatedValues.subtotal,
      tax: calculatedValues.tax,
      total: calculatedValues.total,
      currency: currency,
    };

    if (isEditMode && onEdit && editIndex !== null) {
      onEdit(detail, editIndex);
      onClose();
    } else {
      onAdd(detail);
      form.reset({
        product_id: "",
        price_category_id: "",
        is_igv: false,
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
      <div className="flex flex-col gap-4">
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
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                Historial
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStock(true)}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Ver Stock
              </Button>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          {priceCategories && priceCategories.length > 0 && (
            <FormSelect
              control={form.control}
              name="price_category_id"
              label="Categoría de Precio (opcional)"
              options={priceCategories.map((cat) => ({
                value: cat.id.toString(),
                label: cat.name,
              }))}
              placeholder="Seleccionar categoría"
            />
          )}

          <FormInput
            control={form.control}
            name="quantity"
            label="Cantidad"
            type="number"
            step="0.0001"
            placeholder="0.00"
          />
        </div>

        <FormSwitch
          control={form.control}
          name="is_igv"
          text="Precio incluye IGV"
          textDescription="Activo: el valor ingresado es el precio con IGV. Inactivo: es el valor sin IGV."
          autoHeight
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="unit_value"
            label="Valor Unitario (sin IGV)"
            type="number"
            step="0.0001"
            placeholder="0.00"
            className={isIgv ? "border-dashed opacity-60" : "border-primary"}
          />

          <FormInput
            control={form.control}
            name="unit_price"
            label="Precio Unitario (con IGV)"
            type="number"
            step="0.0001"
            placeholder="0.00"
            className={!isIgv ? "border-dashed opacity-60" : "border-primary"}
          />
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
            onClick={handleSave}
            disabled={!productId || !quantity || !unitValue}
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

      {/* Dialog de historial de ventas */}
      {productId && selectedProduct && (
        <>
          <ProductHistoryDialog
            open={showHistory}
            onOpenChange={setShowHistory}
            productId={parseInt(productId)}
            productName={selectedProduct.name}
            customerId={customerId}
          />
          <ProductStockDialog
            open={showStock}
            onOpenChange={setShowStock}
            productId={parseInt(productId)}
            productName={selectedProduct.name}
          />
        </>
      )}

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
