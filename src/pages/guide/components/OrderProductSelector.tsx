"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertCircle, CheckCircle2 } from "lucide-react";
import type { OrderResource } from "@/pages/order/lib/order.interface";

interface ProductSelection {
  product_id: number;
  product_name: string;
  total_quantity: number;
  shipped_quantity: number;
  remaining_quantity: number;
  quantity_to_ship: number;
}

interface OrderProductSelectorProps {
  order: OrderResource | null;
  onProductsSelected: (products: ProductSelection[]) => void;
}

export const OrderProductSelector = ({
  order,
  onProductsSelected,
}: OrderProductSelectorProps) => {
  const [selections, setSelections] = useState<ProductSelection[]>([]);

  useEffect(() => {
    if (order && order.order_details) {
      // Inicializar las selecciones con los productos del pedido
      const initialSelections: ProductSelection[] = order.order_details.map(
        (detail) => {
          const totalQty = parseFloat(detail.quantity);
          // TODO: Obtener la cantidad ya enviada desde el backend
          // Por ahora asumimos 0, pero esto debe venir del backend
          const shippedQty = 0;
          const remainingQty = totalQty - shippedQty;

          return {
            product_id: detail.product_id,
            product_name: detail.product?.name || "Producto",
            total_quantity: totalQty,
            shipped_quantity: shippedQty,
            remaining_quantity: remainingQty,
            quantity_to_ship: 0,
          };
        }
      );
      setSelections(initialSelections);
    }
  }, [order]);

  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = parseFloat(value) || 0;

    setSelections((prev) =>
      prev.map((sel) => {
        if (sel.product_id === productId) {
          // No permitir más de la cantidad pendiente
          const validQuantity = Math.min(quantity, sel.remaining_quantity);
          return {
            ...sel,
            quantity_to_ship: validQuantity >= 0 ? validQuantity : 0,
          };
        }
        return sel;
      })
    );
  };

  const handleApplySelections = () => {
    // Notificar al padre solo cuando el usuario hace click
    onProductsSelected(selections.filter((s) => s.quantity_to_ship > 0));
  };

  const getStatusBadge = (selection: ProductSelection) => {
    const percentage =
      (selection.shipped_quantity / selection.total_quantity) * 100;

    if (percentage === 0) {
      return <Badge variant="secondary">Pendiente</Badge>;
    } else if (percentage === 100) {
      return <Badge variant="default">Completado</Badge>;
    } else {
      return <Badge variant="outline">Parcial ({percentage.toFixed(0)}%)</Badge>;
    }
  };

  if (!order) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Seleccione un pedido para ver los productos disponibles
        </AlertDescription>
      </Alert>
    );
  }

  const totalToShip = selections.reduce(
    (sum, sel) => sum + sel.quantity_to_ship,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Productos del Pedido #{order.order_number}
        </h3>
        {totalToShip > 0 && (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {totalToShip} unidad(es) seleccionadas
          </Badge>
        )}
      </div>

      {selections.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay productos en este pedido
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad Total</TableHead>
                <TableHead className="text-center">Ya Enviado</TableHead>
                <TableHead className="text-center">Pendiente</TableHead>
                <TableHead className="text-center">A Enviar Ahora</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selections.map((selection) => (
                <TableRow key={selection.product_id}>
                  <TableCell className="font-medium">
                    {selection.product_name}
                  </TableCell>
                  <TableCell className="text-center">
                    {selection.total_quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    {selection.shipped_quantity}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {selection.remaining_quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max={selection.remaining_quantity}
                      step="0.01"
                      value={selection.quantity_to_ship || ""}
                      onChange={(e) =>
                        handleQuantityChange(selection.product_id, e.target.value)
                      }
                      className="w-24 mx-auto text-center"
                      placeholder="0"
                      disabled={selection.remaining_quantity === 0}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(selection)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalToShip === 0 && selections.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debe seleccionar al menos una cantidad a enviar
          </AlertDescription>
        </Alert>
      )}

      {totalToShip > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleApplySelections} type="button">
            Agregar {totalToShip} producto(s) a la guía
          </Button>
        </div>
      )}
    </div>
  );
};
