import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  FileText,
  User,
  Warehouse,
  Calendar,
  CreditCard,
  Wallet,
  Package,
  Receipt,
  Clock,
} from "lucide-react";
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
      title={`Venta #${sale.id}`}
      icon={<ShoppingBag className="h-5 w-5" />}
      className="overflow-y-auto p-2 !gap-0 w-full sm:max-w-3xl"
    >
      <div className="space-y-4 p-4">
        {/* Header con totales destacados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Total Card - Primary */}
          <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground truncate">
                    {currency} {sale.total_amount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagado Card - Secondary */}
          <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Pagado
                  </p>
                  <p className="text-2xl font-bold text-primary truncate">
                    {currency} {sale.total_paid.toFixed(2)}
                  </p>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pendiente Card - Destructive or Success */}
          <Card
            className={`border-none transition-colors !p-0 ${
              sale.current_amount === 0
                ? "bg-primary/5 hover:bg-primary/10"
                : "bg-destructive/5 hover:bg-destructive/10"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Pendiente
                  </p>
                  <p
                    className={`text-2xl font-bold truncate ${
                      sale.current_amount === 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {currency} {sale.current_amount.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    sale.current_amount === 0
                      ? "bg-primary/10"
                      : "bg-destructive/10"
                  }`}
                >
                  <CreditCard
                    className={`h-5 w-5 ${
                      sale.current_amount === 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del Documento */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información del Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Tipo de Documento
                </p>
                <p className="font-semibold">{sale.document_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Número</p>
                <p className="font-mono font-bold text-lg">
                  {sale.full_document_number}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha de Emisión
                </p>
                <p className="font-medium">{formatDate(sale.issue_date)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge
                  variant={
                    sale.status === "PAGADA"
                      ? "default"
                      : sale.status === "REGISTRADO"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-sm"
                >
                  {sale.status}
                </Badge>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo de Pago</p>
                <Badge
                  variant={
                    sale.payment_type === "CONTADO" ? "default" : "secondary"
                  }
                  className="text-sm"
                >
                  {sale.payment_type === "CONTADO"
                    ? "💵 CONTADO"
                    : "📅 CRÉDITO"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cliente */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Nombre Completo</p>
              <p className="font-semibold text-lg">{sale.customer.full_name}</p>
            </div>
            {sale.customer.document_number && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Documento</p>
                <p className="font-medium">
                  {sale.customer.document_type} {sale.customer.document_number}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Almacén y Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Almacén
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold">{sale.warehouse.name}</p>
              <p className="text-sm text-muted-foreground">
                {sale.warehouse.address}
              </p>
            </CardContent>
          </Card>

          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5" />
                Usuario Responsable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold">{sale.user.name}</p>
              {sale.user.email && (
                <p className="text-sm text-muted-foreground">
                  {sale.user.email}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desglose de Pago */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Desglose de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sale.amount_cash > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">💵 Efectivo</span>
                  <span className="font-semibold">
                    {currency} {sale.amount_cash.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.amount_card > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">💳 Tarjeta</span>
                  <span className="font-semibold">
                    {currency} {sale.amount_card.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.amount_yape > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">📱 Yape</span>
                  <span className="font-semibold">
                    {currency} {sale.amount_yape.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.amount_plin > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">📱 Plin</span>
                  <span className="font-semibold">
                    {currency} {sale.amount_plin.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.amount_deposit > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">🏦 Depósito</span>
                  <span className="font-semibold">
                    {currency} {sale.amount_deposit.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.amount_transfer > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">🔄 Transferencia</span>
                  <span className="font-semibold">
                    {currency} {sale.amount_transfer.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.amount_other > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">💰 Otro</span>
                  <span className="font-semibold">
                    {currency} {sale.amount_other.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        {sale.details && sale.details.length > 0 && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({sale.details.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sale.details.map((detail, index) => (
                  <div
                    key={detail.id}
                    className="p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs shrink-0">
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
                              {parseFloat(detail.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              P. Unit:
                            </span>
                            <span className="ml-1 font-medium">
                              {currency}{" "}
                              {parseFloat(detail.unit_price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">
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
            </CardContent>
          </Card>
        )}

        {/* Cuotas */}
        {sale.installments && sale.installments.length > 0 && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cuotas de Pago ({sale.installments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sale.installments.map((installment) => (
                  <div
                    key={installment.id}
                    className="p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-semibold">
                            Cuota {installment.installment_number}
                          </Badge>
                          <Badge
                            variant={
                              installment.status === "PAGADO"
                                ? "default"
                                : installment.status === "PENDIENTE"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {installment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Vence: {formatDate(installment.due_date)} (
                            {installment.due_days} días)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {currency} {parseFloat(installment.amount).toFixed(2)}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            parseFloat(installment.pending_amount) === 0
                              ? "text-primary"
                              : "text-orange-600"
                          }`}
                        >
                          Pendiente: {currency}{" "}
                          {parseFloat(installment.pending_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {sale.observations && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {sale.observations}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer con metadata */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Creado: {formatDateTime(sale.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Actualizado: {formatDateTime(sale.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GeneralSheet>
  );
}
