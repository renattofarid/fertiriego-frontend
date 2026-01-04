import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import { FormInput } from "@/components/FormInput";
import { useForm } from "react-hook-form";
import { Plus, Save } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useEffect, useState } from "react";

interface AddProductSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (detail: ProductDetail) => void;
  products: ProductResource[];
  editingDetail?: ProductDetail | null;
  editingIndex?: number;
  onEdit?: (detail: ProductDetail, index: number) => void;
}

export interface ProductDetail {
  product_id: string;
  product_name: string;
  is_igv: boolean;
  quantity: string;
  unit_price: string;
  purchase_price: string;
  subtotal: number;
  tax: number;
  total: number;
}

export const AddProductSheet = ({
  open,
  onClose,
  onAdd,
  products,
  editingDetail = null,
  editingIndex,
  onEdit,
}: AddProductSheetProps) => {
  const isEditMode = editingDetail !== null;
  const form = useForm({
    defaultValues: {
      product_id: "",
      quantity: "",
      unit_price: "",
      purchase_price: "",
      is_igv: true,
    },
  });

  const [calculatedValues, setCalculatedValues] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const productId = form.watch("product_id");
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unit_price");
  const isIgv = form.watch("is_igv");

  // Load editing data when editingDetail changes
  useEffect(() => {
    if (editingDetail && open) {
      form.reset({
        product_id: editingDetail.product_id,
        quantity: editingDetail.quantity,
        unit_price: editingDetail.unit_price,
        purchase_price: editingDetail.purchase_price,
        is_igv: editingDetail.is_igv,
      });
    } else if (!open) {
      form.reset({
        product_id: "",
        quantity: "",
        unit_price: "",
        purchase_price: "",
        is_igv: true,
      });
      setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
    }
  }, [editingDetail, open, form]);

  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;

    if (qty > 0 && price > 0) {
      if (!isIgv) {
        const subtotal = qty * price;
        const tax = subtotal * 0.18;
        const total = subtotal + tax;
        setCalculatedValues({ subtotal, tax, total });
      } else {
        const total = qty * price;
        const subtotal = total / 1.18;
        const tax = total - subtotal;
        setCalculatedValues({ subtotal, tax, total });
      }
    } else {
      setCalculatedValues({ subtotal: 0, tax: 0, total: 0 });
    }
  }, [quantity, unitPrice, isIgv]);

  const handleAdd = () => {
    const formData = form.getValues();

    if (
      !formData.product_id ||
      !formData.quantity ||
      !formData.unit_price ||
      !formData.purchase_price
    ) {
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
      subtotal: calculatedValues.subtotal,
      tax: calculatedValues.tax,
      total: calculatedValues.total,
    };

    if (isEditMode && onEdit && editingIndex !== undefined) {
      onEdit(detail, editingIndex);
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
      subtitle={
        isEditMode
          ? "Modifique los datos del producto"
          : "Complete los datos del producto"
      }
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
        </div>

        <FormSwitch
          control={form.control}
          name="is_igv"
          text="Incluye IGV"
          textDescription="El precio unitario incluye el IGV"
          autoHeight
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
            onClick={handleAdd}
            disabled={
              !productId ||
              !quantity ||
              !unitPrice ||
              !form.watch("purchase_price")
            }
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
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
    </GeneralSheet>
  );
};
