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
import { FormSelect } from "@/components/FormSelect";
import { Loader } from "lucide-react";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { usePurchaseOrderDetailStore } from "../lib/purchase-order-detail.store";
import { successToast, errorToast } from "@/lib/core.function";

interface PurchaseOrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrderId: number;
  products: ProductResource[];
  detailId?: number | null;
}

export function PurchaseOrderDetailModal({
  open,
  onClose,
  purchaseOrderId,
  products,
  detailId,
}: PurchaseOrderDetailModalProps) {
  const {
    detail,
    fetchDetail,
    createDetail,
    updateDetail,
    isSubmitting,
    resetDetail,
  } = usePurchaseOrderDetailStore();

  const [formData, setFormData] = useState({
    product_id: "",
    quantity_requested: "",
    unit_price_estimated: "",
  });

  const form = useForm({
    defaultValues: {
      product_id: "",
      quantity_requested: "",
      unit_price_estimated: "",
    },
  });

  useEffect(() => {
    if (detailId) {
      fetchDetail(detailId);
    } else {
      resetDetail();
      setFormData({
        product_id: "",
        quantity_requested: "",
        unit_price_estimated: "",
      });
      form.reset({
        product_id: "",
        quantity_requested: "",
        unit_price_estimated: "",
      });
    }
  }, [detailId, fetchDetail, resetDetail, form]);

  useEffect(() => {
    if (detail && detailId) {
      const newFormData = {
        product_id: detail.product_id.toString(),
        quantity_requested: detail.quantity_requested.toString(),
        unit_price_estimated: detail.unit_price_estimated,
      };
      setFormData(newFormData);
      form.reset(newFormData);
    }
  }, [detail, detailId, form]);

  // Sincronizar formulario con estado local
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.product_id ||
      !formData.quantity_requested ||
      !formData.unit_price_estimated
    ) {
      errorToast("Por favor complete todos los campos");
      return;
    }

    try {
      const subtotal = calculateSubtotal();

      if (detailId) {
        await updateDetail(detailId, {
          product_id: Number(formData.product_id),
          quantity_requested: Number(formData.quantity_requested),
          unit_price_estimated: Number(formData.unit_price_estimated),
          subtotal_estimated: subtotal,
        });
        successToast("Detalle actualizado exitosamente");
      } else {
        await createDetail({
          purchase_order_id: purchaseOrderId,
          product_id: Number(formData.product_id),
          quantity_requested: Number(formData.quantity_requested),
          unit_price_estimated: Number(formData.unit_price_estimated),
          subtotal_estimated: subtotal,
        });
        successToast("Detalle agregado exitosamente");
      }

      onClose();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ||
          `Error al ${detailId ? "actualizar" : "agregar"} el detalle`
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
            <FormSelect
              control={form.control}
              name="product_id"
              label="Producto"
              placeholder="Seleccione un producto"
              options={products.map((product) => ({
                value: product.id.toString(),
                label: product.name,
              }))}
              disabled={!!detailId}
            />

            <FormField
              control={form.control}
              name="quantity_requested"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Solicitada</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      
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
                      
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Subtotal:</span>
              <span className="text-lg font-bold text-primary">
                S/. {calculateSubtotal().toFixed(2)}
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
