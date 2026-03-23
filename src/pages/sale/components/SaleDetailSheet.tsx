import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  User,
  Warehouse,
  CreditCard,
  Package,
  Clock,
  ShoppingCart,
  FileCheck,
  Truck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Percent,
} from "lucide-react";
import type { SaleResource } from "../lib/sale.interface";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";

interface SaleDetailSheetProps {
  sale: SaleResource | null;
  open: boolean;
  onClose: () => void;
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{children}</span>
    </div>
  );
}

export default function SaleDetailSheet({ sale, open, onClose }: SaleDetailSheetProps) {
  if (!sale) return null;

  const currency =
    sale.currency === "PEN" ? "S/." : sale.currency === "USD" ? "$" : "€";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalSubtotal = sale.details?.reduce((s, d) => s + Number(d.subtotal), 0) ?? 0;
  const totalTax = sale.details?.reduce((s, d) => s + Number(d.tax), 0) ?? 0;

  const paymentMethods = [
    { label: "Efectivo", emoji: "💵", amount: sale.amount_cash },
    { label: "Tarjeta", emoji: "💳", amount: sale.amount_card },
    { label: "Yape", emoji: "📱", amount: sale.amount_yape },
    { label: "Plin", emoji: "📲", amount: sale.amount_plin },
    { label: "Depósito", emoji: "🏦", amount: sale.amount_deposit },
    { label: "Transferencia", emoji: "🔄", amount: sale.amount_transfer },
    { label: "Otro", emoji: "💰", amount: sale.amount_other },
  ].filter((m) => m.amount > 0);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Venta ${sale.sequential_number}`}
      icon={"ShoppingBag"}
      className="overflow-y-auto p-2 !gap-0 w-full"
      size="4xl"
    >
      <div className="px-5 py-4 space-y-6">

        {/* Banner Retención IGV */}
        {!!sale.is_retencionigv && (
          <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Sujeta a Retención de IGV
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-500/80 mt-0.5">
                Este comprobante tiene retención del IGV aplicada por el cliente.
              </p>
            </div>
          </div>
        )}

        {/* Banner Detracción */}
        {!!sale.is_detraccion && (
          <div className="flex items-center gap-3 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Percent className="h-5 w-5 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                Sujeta a Detracción
              </p>
              <div className="flex flex-wrap gap-3 mt-0.5">
                {sale.codigos_detraccion && (
                  <p className="text-xs text-blue-600/70 dark:text-blue-500/80">
                    Código: <span className="font-medium">{sale.codigos_detraccion}</span>
                  </p>
                )}
                {sale.tipo_cambio && (
                  <p className="text-xs text-blue-600/70 dark:text-blue-500/80">
                    T/C SUNAT: <span className="font-medium">{sale.tipo_cambio}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border">
          <div className="bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-xl font-bold tabular-nums">{currency} {Number(sale.total_amount).toFixed(2)}</p>
            {totalSubtotal > 0 && (
              <p className="text-xs text-muted-foreground/60 mt-0.5 tabular-nums">
                {currency} {totalSubtotal.toFixed(2)} + {currency} {totalTax.toFixed(2)} IGV
              </p>
            )}
          </div>
          <div className="bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Pagado</p>
            <p className="text-xl font-bold text-primary tabular-nums">{currency} {Number(sale.total_paid).toFixed(2)}</p>
          </div>
          <div className="bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">
              {Number(sale.current_amount) === 0 ? "Saldado" : "Pendiente"}
            </p>
            <p className={`text-xl font-bold tabular-nums ${Number(sale.current_amount) === 0 ? "text-primary" : "text-destructive"}`}>
              {currency} {Number(sale.current_amount).toFixed(2)}
            </p>
          </div>
        </div>

        <Separator />

        {/* Documento */}
        <div>
          <SectionTitle icon={FileText} label="Documento" />
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">{sale.document_type}</p>
              <p className="font-mono font-bold text-lg leading-tight">{sale.sequential_number}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge
                variant={
                  sale.status === "PAGADA" ? "default"
                  : sale.status === "REGISTRADO" ? "secondary"
                  : "destructive"
                }
              >
                {sale.status}
              </Badge>
              <Badge variant={sale.payment_type === "CONTADO" ? "default" : "secondary"} className="text-xs">
                {sale.payment_type === "CONTADO" ? "💵 Contado" : "📅 Crédito"}
              </Badge>
            </div>
          </div>

          <Row label="Fecha de emisión">{formatDate(sale.issue_date)}</Row>
          {sale.date_expired && <Row label="Vencimiento">{formatDate(sale.date_expired)}</Row>}
          {sale.order_purchase && (
            <Row label={<span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />Orden de compra</span> as any}>
              {sale.order_purchase}
            </Row>
          )}
          {sale.order_service && (
            <Row label={<span className="flex items-center gap-1"><FileCheck className="h-3 w-3" />Orden de servicio</span> as any}>
              {sale.order_service}
            </Row>
          )}

          {/* Condiciones especiales */}
          {(!!sale.is_anticipado || !!sale.is_deduccion || !!sale.is_retencionigv || !!sale.is_detraccion || !!sale.is_termine_condition) && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
              {!!sale.is_anticipado && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3 text-blue-500" />Anticipado
                </Badge>
              )}
              {!!sale.is_deduccion && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3 text-purple-500" />Con Deducción
                </Badge>
              )}
              {!!sale.is_retencionigv && (
                <Badge className="text-xs gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-400/30 hover:bg-amber-500/15">
                  <ShieldAlert className="h-3 w-3" />Retención IGV
                </Badge>
              )}
              {!!sale.is_detraccion && (
                <Badge className="text-xs gap-1 bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-400/30 hover:bg-blue-500/15">
                  <Percent className="h-3 w-3" />Detracción {sale.codigos_detraccion && `· ${sale.codigos_detraccion}`}
                </Badge>
              )}
              {!!sale.is_termine_condition && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />Condición Térmica
                </Badge>
              )}
            </div>
          )}

          {/* Guías */}
          {sale.guides && Array.isArray(sale.guides) && sale.guides.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <Truck className="h-3 w-3" />Guías de Remisión
              </p>
              <div className="flex flex-wrap gap-2">
                {sale.guides.map((g, i) => (
                  <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-md font-medium">
                    {g.name} · {g.correlative}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sale.guides && typeof sale.guides === "string" && (
            <Row label={<span className="flex items-center gap-1"><Truck className="h-3 w-3" />Guía</span> as any}>
              {sale.guides}
            </Row>
          )}

          {/* Referencias */}
          {(sale.quotation || sale.order) && (
            <div className="flex gap-4 mt-3 pt-3 border-t">
              {sale.quotation && (
                <div>
                  <p className="text-xs text-muted-foreground">Cotización origen</p>
                  <p className="text-sm font-semibold">#{sale.quotation.id}</p>
                </div>
              )}
              {sale.order && (
                <div>
                  <p className="text-xs text-muted-foreground">Pedido origen</p>
                  <p className="text-sm font-semibold">#{sale.order.id}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Cliente, Almacén, Usuario */}
        <div>
          <SectionTitle icon={User} label="Partes" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-muted rounded-full p-2 shrink-0">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-semibold text-sm">{sale.customer.full_name}</p>
                {sale.customer.document_number && (
                  <p className="text-xs text-muted-foreground">
                    {sale.customer.document_type} · {sale.customer.document_number}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pl-0.5">
              <div className="flex items-start gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Almacén</p>
                  <p className="text-sm font-medium">{sale.warehouse.name}</p>
                  {sale.warehouse.address && (
                    <p className="text-xs text-muted-foreground">{sale.warehouse.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Responsable</p>
                  <p className="text-sm font-medium">{sale.user.name}</p>
                  {sale.user.email && (
                    <p className="text-xs text-muted-foreground">{sale.user.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desglose de pago */}
        {paymentMethods.length > 0 && (
          <>
            <Separator />
            <div>
              <SectionTitle icon={Banknote} label="Desglose de Pago" />
              <div className="space-y-0.5">
                {paymentMethods.map((m) => (
                  <div key={m.label} className="flex justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">{m.emoji} {m.label}</span>
                    <span className="text-sm font-medium tabular-nums">{currency} {Number(m.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Productos */}
        {sale.details && sale.details.length > 0 && (
          <>
            <Separator />
            <div>
              <SectionTitle icon={Package} label={`Productos · ${sale.details.length}`} />
              <div className="space-y-0 divide-y">
                {sale.details.map((detail, index) => (
                  <div key={detail.id} className="flex justify-between items-start py-2.5 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">{index + 1}.</span>
                        <p className="text-sm font-medium leading-snug">{detail.product.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                        {Number(detail.quantity).toFixed(2)} × {currency} {Number(detail.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums">{currency} {Number(detail.total).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">IGV {currency} {Number(detail.tax).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Cuotas */}
        {sale.installments && sale.installments.length > 0 && (
          <>
            <Separator />
            <div>
              <SectionTitle icon={CreditCard} label={`Cuotas · ${sale.installments.length}`} />
              <div className="space-y-0 divide-y">
                {sale.installments.map((inst) => (
                  <div key={inst.id} className="flex justify-between items-center py-2.5 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">Cuota {inst.installment_number}</span>
                        <Badge
                          variant={inst.status === "PAGADO" ? "default" : inst.status === "PENDIENTE" ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {inst.status}
                        </Badge>
                        {inst.is_overdue && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />Vencida
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vence {formatDate(inst.due_date)} · {inst.due_days} días
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums">{currency} {Number(inst.amount).toFixed(2)}</p>
                      {Number(inst.pending_amount) > 0 && (
                        <p className="text-xs text-orange-600 tabular-nums">Pend. {currency} {Number(inst.pending_amount).toFixed(2)}</p>
                      )}
                      {Number(inst.pending_amount) === 0 && (
                        <p className="text-xs text-primary flex items-center justify-end gap-0.5">
                          <CheckCircle2 className="h-3 w-3" />Pagado
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Observaciones */}
        {sale.observations && (
          <>
            <Separator />
            <div>
              <SectionTitle icon={FileText} label="Observaciones" />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {sale.observations}
              </p>
            </div>
          </>
        )}

        {/* Trazabilidad */}
        <Separator />
        <TraceabilityTimeline entityType="sale" entityId={sale.id} />

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground/60 pt-1">
          <Clock className="h-3 w-3" />
          <span>Creado {formatDateTime(sale.created_at)}</span>
          <span>·</span>
          <span>Actualizado {formatDateTime(sale.updated_at)}</span>
        </div>

      </div>
    </GeneralSheet>
  );
}
