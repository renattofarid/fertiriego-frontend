import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  ExternalLink,
  Package,
  Plus,
  ShoppingBasket,
} from "lucide-react";
import type { BatchOrderResource } from "../lib/purchase-order-batch.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import { CURRENCIES } from "@/pages/purchase-order/lib/purchase-order.interface";

interface BatchResultStepProps {
  orders: BatchOrderResource[];
  onGoToOrders: () => void;
  onNewBatch: () => void;
}

export default function BatchResultStep({
  orders,
  onGoToOrders,
  onNewBatch,
}: BatchResultStepProps) {
  const totalGeneral = orders.reduce(
    (sum, o) => sum + Number(o.total_estimated),
    0
  );

  return (
    <div className="space-y-5">
      {/* Success header */}
      <div className="flex flex-col items-center text-center py-6 gap-3">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">
            {orders.length === 1
              ? "1 orden de compra generada"
              : `${orders.length} órdenes de compra generadas`}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Las órdenes han sido creadas en estado BORRADOR y están listas para
            revisión.
          </p>
        </div>
        <div className="bg-primary/10 rounded-lg px-6 py-3">
          <p className="text-xs text-muted-foreground">Total general estimado</p>
          <p className="text-2xl font-bold text-primary">
            S/. {totalGeneral.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order) => {
          const currencySymbol =
            CURRENCIES.find((c) => c.value === order.currency)?.symbol ?? "S/.";
          const total = Number(order.total_estimated);
          return (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingBasket className="h-4 w-4" />
                    <Badge variant="outline" className="font-mono">
                      {order.correlativo}
                    </Badge>
                    <span className="font-normal text-muted-foreground">
                      {order.supplier_fullname}
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                    <span className="font-bold text-primary text-sm">
                      {formatCurrency(total, {
                        currencySymbol,
                        decimals: 2,
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">Almacén</p>
                    <p className="font-medium">{order.warehouse_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">N° de Orden</p>
                    <p className="font-medium font-mono">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha emisión</p>
                    <p className="font-medium">{order.issue_date}</p>
                  </div>
                  {order.expected_date && (
                    <div>
                      <p className="text-muted-foreground">Fecha esperada</p>
                      <p className="font-medium">{order.expected_date}</p>
                    </div>
                  )}
                </div>

                {/* Detalles */}
                <div className="space-y-1.5">
                  {order.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded"
                    >
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 font-medium">
                        {detail.product_name}
                      </span>
                      <span className="text-muted-foreground">
                        x{detail.quantity_requested}
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(Number(detail.subtotal_estimated), {
                          currencySymbol,
                          decimals: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onNewBatch}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo lote
        </Button>
        <Button onClick={onGoToOrders}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver órdenes de compra
        </Button>
      </div>
    </div>
  );
}
