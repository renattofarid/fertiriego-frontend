"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSaleById } from "../lib/sale.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Eye,
  Wallet,
  CreditCard,
  FileText,
  User,
  Warehouse,
  Calendar,
  Package,
  CheckCircle2,
  AlertTriangle,
  Percent,
  ShieldAlert,
  Truck,
  FileCheck,
  ShoppingCart,
  Clock,
  TrendingUp,
  Hash,
  Building2,
} from "lucide-react";
import { SALE, type SaleInstallmentResource } from "../lib/sale.interface";
import InstallmentPaymentDialog from "./InstallmentPaymentDialog";
import InstallmentPaymentsSheet from "./InstallmentPaymentsSheet";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import TitleFormComponent from "@/components/TitleFormComponent";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";

const sunatVariantMap: Record<string, "yellow" | "blue" | "green" | "gray" | "red"> = {
  PENDIENTE: "yellow",
  ENVIADO: "blue",
  ACEPTADO: "green",
  BAJA: "gray",
  RECHAZADO: "red",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-medium text-right">{children}</span>
    </div>
  );
}

export default function SaleManagePage() {
  const { id } = useParams<{ id: string }>();
  const { data: sale, isFinding, refetch } = useSaleById(Number(id));
  const { ROUTE } = SALE;
  const [selectedInstallment, setSelectedInstallment] = useState<SaleInstallmentResource | null>(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPaymentsSheet, setOpenPaymentsSheet] = useState(false);

  if (isFinding) return <FormSkeleton />;
  if (!sale) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No se encontró la venta</p>
        </div>
      </FormWrapper>
    );
  }

  const currency = sale.currency === "PEN" ? "S/." : sale.currency === "USD" ? "$" : "€";
  const isContado = sale.payment_type === "CONTADO";
  const currentAmount = Number(sale.current_amount);
  const totalAmount = Number(sale.total_amount);
  const totalPaid = Number(sale.total_paid);
  const paidPercent = totalAmount > 0 ? Math.min(100, (totalPaid / totalAmount) * 100) : 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

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
  ].filter((m) => Number(m.amount) > 0);

  const specialFlags = [
    !!sale.is_anticipado && { label: "Anticipado", color: "text-blue-500", icon: AlertTriangle },
    !!sale.is_deduccion && { label: "Con Deducción", color: "text-purple-500", icon: AlertTriangle },
    !!sale.is_retencionigv && { label: "Retención IGV", color: "text-amber-500", icon: ShieldAlert },
    !!sale.is_detraccion && { label: `Detracción${sale.codigos_detraccion ? ` · ${sale.codigos_detraccion}` : ""}`, color: "text-blue-600", icon: Percent },
    !!sale.is_termine_condition && { label: "Cond. Térmica", color: "text-orange-500", icon: AlertTriangle },
  ].filter(Boolean) as { label: string; color: string; icon: React.ElementType }[];

  return (
    <FormWrapper>
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TitleFormComponent
          title={`Gestionar Venta`}
          mode="detail"
          icon="CreditCard"
          backRoute={ROUTE}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={
              sale.status === "PAGADA" ? "default"
              : sale.status === "REGISTRADO" ? "secondary"
              : sale.status === "PARCIAL" ? "outline"
              : "destructive"
            }
            className="text-sm px-3 py-1"
          >
            {sale.status}
          </Badge>
          <Badge variant={sunatVariantMap[sale.status_facturado] ?? "gray"} className="text-sm px-3 py-1">
            SUNAT · {sale.status_facturado}
          </Badge>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <Card className="overflow-hidden !gap-0 border-primary/20">
        <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent px-6 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {sale.document_type}
              </p>
              <p className="text-3xl font-bold font-mono tracking-tight text-primary">
                {sale.sequential_number}
              </p>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-10" />
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-sm font-semibold leading-snug truncate max-w-[160px]" title={sale.customer.full_name}>
                  {sale.customer.full_name}
                </p>
                {sale.customer.document_number && (
                  <p className="text-xs text-muted-foreground font-mono">{sale.customer.document_number}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Emisión</p>
                <p className="text-sm font-semibold">{formatDate(sale.issue_date)}</p>
                {sale.date_expired && (
                  <p className="text-xs text-muted-foreground">Vence {formatDate(sale.date_expired)}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Pago</p>
                <p className="text-sm font-semibold">
                  {sale.payment_type === "CONTADO" ? "💵 Contado" : "📅 Crédito"}
                </p>
                <p className="text-xs text-muted-foreground">{sale.currency}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Almacén</p>
                <p className="text-sm font-semibold truncate max-w-[140px]">{sale.warehouse.name}</p>
                <p className="text-xs text-muted-foreground">{sale.user.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas financieras */}
        <div className="grid grid-cols-3 divide-x border-t">
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">Total facturado</p>
            <p className="text-2xl font-bold tabular-nums">{currency} {totalAmount.toFixed(2)}</p>
            {totalSubtotal > 0 && (
              <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                {currency} {totalSubtotal.toFixed(2)} + {currency} {totalTax.toFixed(2)} IGV
              </p>
            )}
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">Pagado</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{currency} {totalPaid.toFixed(2)}</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{paidPercent.toFixed(0)}% pagado</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">
              {currentAmount === 0 ? "Saldado" : "Por cobrar"}
            </p>
            <p className={`text-2xl font-bold tabular-nums ${currentAmount === 0 ? "text-primary" : "text-destructive"}`}>
              {currency} {currentAmount.toFixed(2)}
            </p>
            {currentAmount === 0 ? (
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completamente pagado
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                {sale.installments?.filter(i => Number(i.pending_amount) > 0).length || 0} cuota(s) pendiente(s)
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── Banners especiales ────────────────────────────────────── */}
      {(!!sale.is_retencionigv || !!sale.is_detraccion) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {!!sale.is_retencionigv && (
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Retención IGV</p>
                <p className="text-xs text-amber-600/70">Retención del IGV aplicada por el cliente</p>
              </div>
            </div>
          )}
          {!!sale.is_detraccion && (
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/25 rounded-lg">
              <Percent className="h-4 w-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  Detracción{sale.codigos_detraccion && ` · ${sale.codigos_detraccion}`}
                </p>
                {sale.tipo_cambio && (
                  <p className="text-xs text-blue-600/70">T/C SUNAT: {sale.tipo_cambio}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Layout principal: 2 columnas ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">

        {/* ── Columna izquierda ──────────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Productos */}
          {sale.details && sale.details.length > 0 && (
            <Card className="!gap-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Productos
                  </span>
                  <Badge variant="secondary" className="font-mono">{sale.details.length} ítem{sale.details.length !== 1 ? "s" : ""}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="pl-5 w-8">#</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cant.</TableHead>
                        <TableHead className="text-right">P. Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">IGV</TableHead>
                        <TableHead className="text-right pr-5 font-semibold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.details.map((detail, i) => (
                        <TableRow key={detail.id} className="hover:bg-muted/20">
                          <TableCell className="pl-5 text-muted-foreground text-xs">{i + 1}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{detail.product.name}</p>
                            {detail.product.code && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">{detail.product.code}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {Number(detail.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                            {currency} {Number(detail.unit_price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                            {currency} {Number(detail.subtotal).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                            {currency} {Number(detail.tax).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums pr-5">
                            {currency} {Number(detail.total).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Fila de totales */}
                <div className="flex justify-end gap-6 px-5 py-3 bg-muted/30 border-t text-sm tabular-nums">
                  <span className="text-muted-foreground">
                    Subtotal: <span className="font-medium text-foreground">{currency} {totalSubtotal.toFixed(2)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    IGV: <span className="font-medium text-foreground">{currency} {totalTax.toFixed(2)}</span>
                  </span>
                  <span className="font-bold text-base">
                    Total: <span className="text-primary">{currency} {totalAmount.toFixed(2)}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cuotas */}
          <Card className="!gap-0">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {isContado ? "Pago al Contado" : "Cuotas de Crédito"}
                </span>
                {!isContado && (
                  <Badge variant="secondary">{sale.installments?.length || 0} cuota(s)</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isContado ? (
                <div className="flex items-center gap-4 px-5 py-6">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Venta registrada al contado</p>
                    <p className="text-sm text-muted-foreground">No requiere gestión de cuotas</p>
                  </div>
                  {currentAmount === 0 && (
                    <Badge className="ml-auto" variant="default">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Saldado
                    </Badge>
                  )}
                </div>
              ) : !sale.installments || sale.installments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No hay cuotas registradas
                </div>
              ) : (
                <div className="divide-y">
                  {sale.installments.map((inst) => {
                    const isPending = Number(inst.pending_amount) > 0;
                    const isOverdue = isPending && inst.status === "VENCIDO";
                    return (
                      <div
                        key={inst.id}
                        className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20 ${
                          isOverdue ? "bg-destructive/4" : ""
                        }`}
                      >
                        {/* Número de cuota */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          !isPending ? "bg-primary/10 text-primary"
                          : isOverdue ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          {inst.installment_number}
                        </div>

                        {/* Info central */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant={
                                  inst.status === "PAGADA" ? "default"
                                  : inst.status === "PARCIAL" ? "outline"
                                  : isOverdue ? "destructive"
                                  : "secondary"
                                }
                                className="text-xs"
                              >
                                {inst.status}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs gap-1">
                                  <AlertTriangle className="h-2.5 w-2.5" />Vencida
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(inst.due_date)} · {inst.due_days}d
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Monto cuota</p>
                            <p className="font-semibold tabular-nums text-sm">
                              {currency} {Number(inst.amount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pendiente</p>
                            {isPending ? (
                              <p className="font-semibold tabular-nums text-sm text-destructive">
                                {currency} {Number(inst.pending_amount).toFixed(2)}
                              </p>
                            ) : (
                              <p className="font-semibold text-sm text-primary flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />Pagado
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedInstallment(inst); setOpenPaymentsSheet(true); }}
                            className="h-8 px-3 text-muted-foreground"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />Pagos
                          </Button>
                          {isPending && (
                            <Button
                              size="sm"
                              onClick={() => { setSelectedInstallment(inst); setOpenPaymentDialog(true); }}
                              className="h-8 px-3"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />Pagar
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trazabilidad */}
          <Card className="!gap-0">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Trazabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <TraceabilityTimeline entityType="sale" entityId={sale.id} />
            </CardContent>
          </Card>
        </div>

        {/* ── Columna derecha (sidebar) ──────────────────────────── */}
        <div className="space-y-4">

          {/* Documento */}
          <Card className="!gap-0">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                <FileText className="h-3.5 w-3.5" />
                Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <InfoRow label="Tipo">
                <Badge variant="outline" className="font-mono">{sale.document_type}</Badge>
              </InfoRow>
              <InfoRow label="Número">
                <span className="font-mono font-bold">{sale.sequential_number}</span>
              </InfoRow>
              <InfoRow label="Emisión">{formatDate(sale.issue_date)}</InfoRow>
              {sale.date_expired && (
                <InfoRow label="Vencimiento">{formatDate(sale.date_expired)}</InfoRow>
              )}
              <InfoRow label="Tipo pago">
                <Badge variant={sale.payment_type === "CONTADO" ? "default" : "secondary"} className="text-xs">
                  {sale.payment_type}
                </Badge>
              </InfoRow>
              <InfoRow label="Moneda">
                <Badge variant="outline">{sale.currency}</Badge>
              </InfoRow>

              {/* Referencias */}
              {(sale.order_purchase || sale.order_service || sale.quotation || sale.order) && (
                <>
                  <Separator className="my-2" />
                  {sale.order_purchase && (
                    <InfoRow label={
                      <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />O. Compra</span> as any
                    }>
                      <span className="font-mono text-xs">{sale.order_purchase}</span>
                    </InfoRow>
                  )}
                  {sale.order_service && (
                    <InfoRow label={
                      <span className="flex items-center gap-1"><FileCheck className="h-3 w-3" />O. Servicio</span> as any
                    }>
                      <span className="font-mono text-xs">{sale.order_service}</span>
                    </InfoRow>
                  )}
                  {sale.quotation && (
                    <InfoRow label="Cotización">
                      <Badge variant="outline" className="font-mono text-xs">#{sale.quotation.id}</Badge>
                    </InfoRow>
                  )}
                  {sale.order && (
                    <InfoRow label="Pedido">
                      <Badge variant="outline" className="font-mono text-xs">#{sale.order.id}</Badge>
                    </InfoRow>
                  )}
                </>
              )}

              {/* Condiciones especiales */}
              {specialFlags.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {specialFlags.map((f) => (
                      <Badge
                        key={f.label}
                        variant="secondary"
                        className="text-xs gap-1"
                      >
                        <f.icon className={`h-3 w-3 ${f.color}`} />
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Guías */}
              {sale.guides && Array.isArray(sale.guides) && sale.guides.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="py-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Truck className="h-3 w-3" />Guías de Remisión
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sale.guides.map((g, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {g.name} · {g.correlative}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Partes */}
          <Card className="!gap-0">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                <User className="h-3.5 w-3.5" />
                Partes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-md p-1.5 shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-sm leading-snug">{sale.customer.full_name}</p>
                  {sale.customer.document_number && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {sale.customer.document_type} · {sale.customer.document_number}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-md p-1.5 shrink-0 mt-0.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Almacén</p>
                  <p className="font-semibold text-sm">{sale.warehouse.name}</p>
                  {sale.warehouse.address && (
                    <p className="text-xs text-muted-foreground">{sale.warehouse.address}</p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-md p-1.5 shrink-0 mt-0.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Responsable</p>
                  <p className="font-semibold text-sm">{sale.user.name}</p>
                  {sale.user.email && (
                    <p className="text-xs text-muted-foreground">{sale.user.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desglose de pago */}
          {paymentMethods.length > 0 && (
            <Card className="!gap-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                  <Wallet className="h-3.5 w-3.5" />
                  Desglose de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                {paymentMethods.map((m) => (
                  <InfoRow key={m.label} label={`${m.emoji} ${m.label}`}>
                    <span className="tabular-nums">{currency} {Number(m.amount).toFixed(2)}</span>
                  </InfoRow>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Observaciones */}
          {sale.observations && (
            <Card className="!gap-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                  <FileText className="h-3.5 w-3.5" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {sale.observations}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <div className="flex flex-col gap-1 px-1 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />Creado {formatDateTime(sale.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />Actualizado {formatDateTime(sale.updated_at)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────── */}
      <InstallmentPaymentDialog
        open={openPaymentDialog}
        onClose={() => { setOpenPaymentDialog(false); setSelectedInstallment(null); }}
        installment={selectedInstallment}
        currency={currency}
        onSuccess={() => { refetch(); setOpenPaymentDialog(false); setSelectedInstallment(null); }}
      />
      <InstallmentPaymentsSheet
        open={openPaymentsSheet}
        onClose={() => { setOpenPaymentsSheet(false); setSelectedInstallment(null); }}
        installment={selectedInstallment}
        currency={currency}
      />
    </FormWrapper>
  );
}
