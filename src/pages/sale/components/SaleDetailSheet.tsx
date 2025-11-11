import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import type { SaleResource } from "../lib/sale.interface";

interface SaleDetailSheetProps {
  sale: SaleResource | null;
  open: boolean;
  onClose: () => void;
}

export default function SaleDetailSheet({
  sale,
  open,
  onClose,
}: SaleDetailSheetProps) {
  if (!sale) return null;

  const currency =
    sale.currency === "PEN" ? "S/." : sale.currency === "USD" ? "$" : "€";

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

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Detalle de Venta #${sale.id}`}
      icon={<ShoppingBag className="h-5 w-5" />}
      className="overflow-y-auto p-2 !gap-0 w-full sm:max-w-2xl"
    >
      <div className="space-y-6 p-4">
        {/* Documento */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            DOCUMENTO
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="font-medium">{sale.document_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Número</p>
              <p className="font-mono font-semibold">
                {sale.full_document_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha Emisión</p>
              <p className="font-medium">{formatDate(sale.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge
                variant={
                  sale.status === "PAGADA"
                    ? "default"
                    : sale.status === "REGISTRADO"
                    ? "secondary"
                    : "destructive"
                }
              >
                {sale.status}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Cliente */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            CLIENTE
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium">{sale.customer.full_name}</p>
            </div>
            {sale.customer.document_number && (
              <div>
                <p className="text-xs text-muted-foreground">Documento</p>
                <p className="font-medium">
                  {sale.customer.document_type} {sale.customer.document_number}
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Almacén y Usuario */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            ALMACÉN Y USUARIO
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Almacén</p>
              <p className="font-medium">{sale.warehouse.name}</p>
              <p className="text-xs text-muted-foreground">
                {sale.warehouse.address}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Usuario</p>
              <p className="font-medium">{sale.user.name}</p>
              {sale.user.email && (
                <p className="text-xs text-muted-foreground">
                  {sale.user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Tipo de Pago */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            TIPO DE PAGO
          </h3>
          <div className="space-y-2">
            <Badge
              variant={
                sale.payment_type === "CONTADO" ? "default" : "secondary"
              }
            >
              {sale.payment_type}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Montos */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            DESGLOSE DE PAGO
          </h3>
          <div className="space-y-2">
            {sale.amount_cash > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Efectivo</span>
                <span className="font-semibold">
                  {currency} {sale.amount_cash.toFixed(2)}
                </span>
              </div>
            )}
            {sale.amount_card > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Tarjeta</span>
                <span className="font-semibold">
                  {currency} {sale.amount_card.toFixed(2)}
                </span>
              </div>
            )}
            {sale.amount_yape > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Yape</span>
                <span className="font-semibold">
                  {currency} {sale.amount_yape.toFixed(2)}
                </span>
              </div>
            )}
            {sale.amount_plin > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Plin</span>
                <span className="font-semibold">
                  {currency} {sale.amount_plin.toFixed(2)}
                </span>
              </div>
            )}
            {sale.amount_deposit > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Depósito</span>
                <span className="font-semibold">
                  {currency} {sale.amount_deposit.toFixed(2)}
                </span>
              </div>
            )}
            {sale.amount_transfer > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Transferencia</span>
                <span className="font-semibold">
                  {currency} {sale.amount_transfer.toFixed(2)}
                </span>
              </div>
            )}
            {sale.amount_other > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Otro</span>
                <span className="font-semibold">
                  {currency} {sale.amount_other.toFixed(2)}
                </span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Pagado</span>
              <span className="text-green-600">
                {currency} {sale.total_paid.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Totales */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            TOTALES
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">
                {currency} {sale.total_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Saldo Pendiente</span>
              <span
                className={`font-bold ${
                  sale.current_amount === 0
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {currency} {sale.current_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {sale.observations && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                OBSERVACIONES
              </h3>
              <p className="text-sm">{sale.observations}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Detalles de productos */}
        {sale.details && sale.details.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              PRODUCTOS ({sale.details.length})
            </h3>
            <div className="space-y-2">
              {sale.details.map((detail) => (
                <div
                  key={detail.id}
                  className="p-3 border rounded-md space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{detail.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Cantidad: {parseFloat(detail.quantity).toFixed(2)} x{" "}
                        {currency} {parseFloat(detail.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {currency} {parseFloat(detail.total).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IGV: {currency} {parseFloat(detail.tax).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cuotas */}
        {sale.installments && sale.installments.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                CUOTAS ({sale.installments.length})
              </h3>
              <div className="space-y-2">
                {sale.installments.map((installment) => (
                  <div
                    key={installment.id}
                    className="p-3 border rounded-md space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">
                          Cuota {installment.installment_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vence: {formatDate(installment.due_date)} (
                          {installment.due_days} días)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {currency} {parseFloat(installment.amount).toFixed(2)}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            parseFloat(installment.pending_amount) === 0
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          Pendiente: {currency}{" "}
                          {parseFloat(installment.pending_amount).toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            installment.status === "PAGADO"
                              ? "default"
                              : installment.status === "PENDIENTE"
                              ? "secondary"
                              : "destructive"
                          }
                          className="mt-1"
                        >
                          {installment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Creado: {formatDateTime(sale.created_at)}</p>
          <p>Actualizado: {formatDateTime(sale.updated_at)}</p>
        </div>
      </div>
    </GeneralSheet>
  );
}
