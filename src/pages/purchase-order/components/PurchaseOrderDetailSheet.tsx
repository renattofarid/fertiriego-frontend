import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  User,
  Warehouse,
  Calendar,
  Package,
  Receipt,
  Clock,
  ShoppingBasket,
  Hash,
  Link,
} from "lucide-react";
import type { PurchaseOrderResource } from "../lib/purchase-order.interface";

interface PurchaseOrderDetailSheetProps {
  purchaseOrder: PurchaseOrderResource | null;
  open: boolean;
  onClose: () => void;
}

export default function PurchaseOrderDetailSheet({
  purchaseOrder,
  open,
  onClose,
}: PurchaseOrderDetailSheetProps) {
  if (!purchaseOrder) return null;

  const applyIgv = purchaseOrder.apply_igv === 1;

  const subtotal = purchaseOrder.details.reduce(
    (acc, d) => acc + Number(d.subtotal_estimated),
    0,
  );
  const igv = applyIgv ? subtotal * 0.18 : 0;
  const total = applyIgv ? subtotal * 1.18 : subtotal;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Pendiente":
        return "secondary";
      case "Completada":
        return "default";
      case "Cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Orden de Compra ${purchaseOrder.correlativo}`}
      icon="ShoppingBasket"
      className="overflow-y-auto p-2 !gap-0 w-full"
      size="4xl"
    >
      <div className="space-y-4 p-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Total Estimado
                  </p>
                  <p className="text-2xl font-bold text-primary truncate">
                    S/. {total.toFixed(2)}
                  </p>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Productos
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground truncate">
                    {purchaseOrder.details.length} ítems
                  </p>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información General */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Correlativo
                </p>
                <p className="font-mono font-bold text-lg">
                  {purchaseOrder.correlativo}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge
                  variant={statusVariant(purchaseOrder.status)}
                  className="font-semibold"
                >
                  {purchaseOrder.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha de Emisión
                </p>
                <p className="font-medium">
                  {formatDate(purchaseOrder.issue_date)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha Esperada
                </p>
                <p className="font-medium">
                  {formatDate(purchaseOrder.expected_date)}
                </p>
              </div>

              {purchaseOrder.order_number && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">N° de Orden</p>
                  <p className="font-medium">{purchaseOrder.order_number}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">IGV</p>
                <Badge variant={applyIgv ? "default" : "secondary"}>
                  {applyIgv ? "Aplica IGV (18%)" : "Sin IGV"}
                </Badge>
              </div>
            </div>

            {purchaseOrder.purchase_correlativo && (
              <div className="pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    Compra vinculada
                  </p>
                  <Badge variant="outline" className="font-mono">
                    {purchaseOrder.purchase_correlativo}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proveedor y Almacén */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBasket className="h-5 w-5" />
                Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold">{purchaseOrder.supplier_fullname}</p>
            </CardContent>
          </Card>

          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Almacén
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {purchaseOrder.warehouse_name ? (
                <p className="font-semibold">{purchaseOrder.warehouse_name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Sin almacén</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Responsable */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Responsable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{purchaseOrder.user_name}</p>
          </CardContent>
        </Card>

        {/* Detalles de productos */}
        {purchaseOrder.details.length > 0 && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({purchaseOrder.details.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchaseOrder.details.map((detail, index) => (
                  <div
                    key={detail.id}
                    className="p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0"
                          >
                            #{index + 1}
                          </Badge>
                          <p className="font-semibold text-sm leading-tight">
                            {detail.product_name}
                          </p>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Cantidad:
                            </span>
                            <span className="ml-1 font-medium">
                              {Number(detail.quantity_requested).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              P. Unit.:
                            </span>
                            <span className="ml-1 font-medium">
                              S/. {Number(detail.unit_price_estimated).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">
                          S/. {Number(detail.subtotal_estimated).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Totales */}
                <div className="pt-3 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">S/. {subtotal.toFixed(2)}</span>
                  </div>
                  {applyIgv && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IGV (18%)</span>
                      <span className="font-medium">S/. {igv.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-1 border-t">
                    <span>Total</span>
                    <span className="text-primary">S/. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {purchaseOrder.observations && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {purchaseOrder.observations}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer con metadata */}
        <Card className="bg-muted/30 !gap-0">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Creado: {formatDateTime(purchaseOrder.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GeneralSheet>
  );
}
