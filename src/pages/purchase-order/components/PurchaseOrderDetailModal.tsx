import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    }
  }, [detailId, fetchDetail, resetDetail]);

  useEffect(() => {
    if (detail && detailId) {
      setFormData({
        product_id: detail.product_id.toString(),
        quantity_requested: detail.quantity_requested.toString(),
        unit_price_estimated: detail.unit_price_estimated,
      });
    }
  }, [detail, detailId]);

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_id">Producto</Label>
            <select
              id="product_id"
              value={formData.product_id}
              onChange={(e) =>
                setFormData({ ...formData, product_id: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              disabled={!!detailId}
            >
              <option value="">Seleccione un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id.toString()}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="quantity_requested">Cantidad Solicitada</Label>
            <Input
              id="quantity_requested"
              type="number"
              variant="primary"
              placeholder="0"
              value={formData.quantity_requested}
              onChange={(e) =>
                setFormData({ ...formData, quantity_requested: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="unit_price_estimated">Precio Unitario Estimado</Label>
            <Input
              id="unit_price_estimated"
              type="number"
              step="0.01"
              variant="primary"
              placeholder="0.00"
              value={formData.unit_price_estimated}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unit_price_estimated: e.target.value,
                })
              }
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
      </DialogContent>
    </Dialog>
  );
}
