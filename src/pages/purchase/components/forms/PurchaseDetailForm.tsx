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
import { Loader } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PurchaseDetailResource } from "../../lib/purchase.interface";

interface PurchaseDetailFormProps {
  products: ProductResource[];
  detail?: PurchaseDetailResource | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function PurchaseDetailForm({
  products,
  detail,
  onSubmit,
  onCancel,
  isSubmitting,
}: PurchaseDetailFormProps) {
  const [formData, setFormData] = useState({
    product_id: detail?.product_id.toString() || "",
    quantity: detail?.quantity || "",
    unit_price: detail?.unit_price || "",
    tax: detail?.tax || "",
  });

  const form = useForm({
    defaultValues: formData,
  });

  useEffect(() => {
    if (detail) {
      const newData = {
        product_id: detail.product_id.toString(),
        quantity: detail.quantity,
        unit_price: detail.unit_price,
        tax: detail.tax,
      };
      setFormData(newData);
      form.reset(newData);
    }
  }, [detail, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setFormData({
        product_id: values.product_id || "",
        quantity: values.quantity || "",
        unit_price: values.unit_price || "",
        tax: values.tax || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const calculateSubtotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.unit_price) || 0;
    return quantity * price;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(formData.tax) || 0;
    return subtotal + tax;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      product_id: Number(formData.product_id),
      quantity: Number(formData.quantity),
      unit_price: Number(formData.unit_price),
      tax: Number(formData.tax),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect
          control={form.control}
          name="product_id"
          label="Producto"
          placeholder="Seleccione un producto"
          options={products.map((product) => ({
            value: product.id.toString(),
            label: product.name,
          }))}
          disabled={!!detail}
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
          name="unit_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Unitario</FormLabel>
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

        <FormField
          control={form.control}
          name="tax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impuesto (IGV)</FormLabel>
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

        <div className="bg-sidebar p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Subtotal:</span>
            <span className="text-lg font-semibold">
              {calculateSubtotal().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold text-green-600">
              {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
