import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormSelect } from "@/components/FormSelect";
import { Plus } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";

interface PurchaseOrderDetailFormProps {
  products: ProductResource[];
  detail?: {
    product_id: string;
    quantity_requested: string;
    unit_price_estimated: string;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function PurchaseOrderDetailForm({
  products,
  detail,
  onSubmit,
  onCancel,
  isEditing = false,
}: PurchaseOrderDetailFormProps) {
  const [formData, setFormData] = useState({
    product_id: detail?.product_id || "",
    quantity_requested: detail?.quantity_requested || "",
    unit_price_estimated: detail?.unit_price_estimated || "",
  });

  const form = useForm({
    defaultValues: formData,
  });

  // Sincronizar cuando cambia el detalle (para modo edición)
  useEffect(() => {
    if (detail) {
      const newData = {
        product_id: detail.product_id,
        quantity_requested: detail.quantity_requested,
        unit_price_estimated: detail.unit_price_estimated,
      };
      setFormData(newData);
      form.reset(newData);
    }
  }, [detail, form]);

  // Observar cambios en el formulario sin causar loops
  useEffect(() => {
    const subscription = form.watch((values) => {
      setFormData({
        product_id: values.product_id || "",
        quantity_requested: values.quantity_requested || "",
        unit_price_estimated: values.unit_price_estimated || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const calculateSubtotal = () => {
    const quantity = parseFloat(formData.quantity_requested) || 0;
    const price = parseFloat(formData.unit_price_estimated) || 0;
    return quantity * price;
  };

  const handleSubmit = () => {
    if (
      !formData.product_id ||
      !formData.quantity_requested ||
      !formData.unit_price_estimated
    ) {
      return;
    }

    onSubmit({
      product_id: formData.product_id,
      quantity_requested: formData.quantity_requested,
      unit_price_estimated: formData.unit_price_estimated,
      subtotal: calculateSubtotal(),
    });

    // Limpiar formulario después de agregar o actualizar
    const emptyData = {
      product_id: "",
      quantity_requested: "",
      unit_price_estimated: "",
    };
    setFormData(emptyData);
    form.reset(emptyData);
  };

  const isFormValid =
    formData.product_id !== "" &&
    formData.quantity_requested !== "" &&
    formData.unit_price_estimated !== "" &&
    parseFloat(formData.quantity_requested) > 0 &&
    parseFloat(formData.unit_price_estimated) >= 0;

  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormSelect
          control={form.control}
          name="product_id"
          label="Producto"
          placeholder="Seleccione un producto"
          options={products.map((product) => ({
            value: product.id.toString(),
            label: product.name,
            description: product.category_name,
          }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity_requested"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    variant="primary"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_price_estimated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Unitario Estimado</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    variant="primary"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-sidebar p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Subtotal:</span>
            <span className="text-lg font-bold text-green-600">
              S/. {calculateSubtotal().toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {isEditing && (
            <Button type="button" variant="neutral" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="button" onClick={handleSubmit} disabled={!isFormValid}>
            <Plus className="mr-2 h-4 w-4" />
            {isEditing ? "Actualizar" : "Agregar"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
