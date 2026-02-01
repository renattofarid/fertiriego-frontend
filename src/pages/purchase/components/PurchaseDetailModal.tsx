import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Loader } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { errorToast, successToast } from "@/lib/core.function";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";

interface PurchaseDetailModalProps {
  open: boolean;
  onClose: () => void;
  purchaseId: number;
  detailId?: number | null;
}

export function PurchaseDetailModal({
  open,
  onClose,
  purchaseId,
  detailId,
}: PurchaseDetailModalProps) {
  const {
    detail,
    fetchDetail,
    createDetail,
    updateDetail,
    isSubmitting,
    resetDetail,
  } = usePurchaseDetailStore();

  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    unit_price: "",
    tax: "",
  });

  const form = useForm({
    defaultValues: {
      product_id: "",
      quantity: "",
      unit_price: "",
      tax: "",
    },
  });

  useEffect(() => {
    if (detailId) {
      fetchDetail(detailId);
    } else {
      resetDetail();
      setFormData({
        product_id: "",
        quantity: "",
        unit_price: "",
        tax: "",
      });
      form.reset({
        product_id: "",
        quantity: "",
        unit_price: "",
        tax: "",
      });
    }
  }, [detailId, fetchDetail, resetDetail, form]);

  useEffect(() => {
    if (detail && detailId) {
      const newFormData = {
        product_id: detail.product_id.toString(),
        quantity: detail.quantity,
        unit_price: detail.unit_price,
        tax: detail.tax,
      };
      setFormData(newFormData);
      form.reset(newFormData);
    }
  }, [detail, detailId, form]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.product_id ||
      !formData.quantity ||
      !formData.unit_price ||
      !formData.tax
    ) {
      errorToast("Por favor complete todos los campos");
      return;
    }

    try {
      if (detailId) {
        await updateDetail(detailId, {
          product_id: Number(formData.product_id),
          quantity: Number(formData.quantity),
          unit_price: Number(formData.unit_price),
          tax: Number(formData.tax),
        });
        successToast("Detalle actualizado exitosamente");
      } else {
        await createDetail({
          purchase_id: purchaseId,
          product_id: Number(formData.product_id),
          quantity: Number(formData.quantity),
          unit_price: Number(formData.unit_price),
          tax: Number(formData.tax),
        });
        successToast("Detalle agregado exitosamente");
      }

      onClose();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ||
          `Error al ${detailId ? "actualizar" : "agregar"} el detalle`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {detailId ? "Editar Detalle" : "Agregar Detalle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto"
              placeholder="Seleccione un producto"
              useQueryHook={useProduct}
              mapOptionFn={(product: ProductResource) => ({
                value: product.id.toString(),
                label: product.name,
              })}
              disabled={!!detailId}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
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
                <span className="text-lg font-bold text-primary">
                  {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Loader
                  className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
                />
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
