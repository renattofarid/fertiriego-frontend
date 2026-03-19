"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Package,
  User,
  Building2,
  Hash,
  MapPin,
  Clock,
  TrendingUp,
  ShoppingCart,
  FileCheck,
  CreditCard,
  ArrowLeftRight,
} from "lucide-react";
import type { QuotationResource } from "../lib/quotation.interface";
import { findQuotationById } from "../lib/quotation.actions";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";
import FormWrapper from "@/components/FormWrapper";
import { QUOTATION } from "../lib/quotation.interface";
import FormSkeleton from "@/components/FormSkeleton";
import TitleFormComponent from "@/components/TitleFormComponent";

const statusVariant: Record<string, "yellow" | "green" | "red" | "gray" | "default" | "secondary"> = {
  Pendiente: "yellow",
  Aprobado: "green",
  Rechazado: "red",
  Vencido: "gray",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-medium text-right">{children}</span>
    </div>
  );
}

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<QuotationResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { ROUTE, ICON } = QUOTATION;

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await findQuotationById(parseInt(id));
        setQuotation(response.data);
      } catch (error) {
        console.error("Error al cargar cotización", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (isLoading) return <FormSkeleton />;

  if (!quotation) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cotización no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  const currency =
    quotation.currency === "PEN" ? "S/." : quotation.currency === "USD" ? "$" : "€";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const total = quotation.quotation_details?.reduce((s, d) => s + parseFloat(d.total || "0"), 0) ?? 0;
  const subtotal = quotation.quotation_details?.reduce((s, d) => s + parseFloat(d.subtotal || "0"), 0) ?? 0;
  const tax = quotation.quotation_details?.reduce((s, d) => s + parseFloat(d.tax || "0"), 0) ?? 0;

  return (
    <FormWrapper>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TitleFormComponent
          title="Cotización"
          mode="detail"
          icon={ICON}
          backRoute={ROUTE}
        />
        <Badge
          variant={statusVariant[quotation.status] ?? "secondary"}
          className="text-sm px-3 py-1"
        >
          {quotation.status}
        </Badge>
      </div>

      {/* ── Hero ── */}
      <Card className="overflow-hidden !gap-0 border-primary/20">
        <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent px-6 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Cotización</p>
              <p className="text-3xl font-bold font-mono tracking-tight text-primary">
                {quotation.quotation_number}
              </p>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-10" />
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p
                  className="text-sm font-semibold leading-snug truncate max-w-[160px]"
                  title={quotation.customer.business_name || quotation.customer.full_name}
                >
                  {quotation.customer.business_name || quotation.customer.full_name}
                </p>
                {quotation.customer.number_document && (
                  <p className="text-xs text-muted-foreground font-mono">{quotation.customer.number_document}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Emisión</p>
                <p className="text-sm font-semibold">{formatDate(quotation.fecha_emision)}</p>
                <p className="text-xs text-muted-foreground">Vigencia: {quotation.validity_time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Pago</p>
                <p className="text-sm font-semibold">
                  {quotation.payment_type === "CONTADO" ? "💵 Contado" : "📅 Crédito"}
                </p>
                {quotation.payment_type === "CREDITO" && quotation.days && (
                  <p className="text-xs text-muted-foreground">{quotation.days} días</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Almacén</p>
                <p className="text-sm font-semibold truncate max-w-[140px]">{quotation.warehouse.name}</p>
                <p className="text-xs text-muted-foreground">{quotation.user.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-3 divide-x border-t">
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
            <p className="text-2xl font-bold tabular-nums">{currency} {subtotal.toFixed(2)}</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">IGV</p>
            <p className="text-2xl font-bold tabular-nums text-muted-foreground">{currency} {tax.toFixed(2)}</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold tabular-nums text-primary">{currency} {total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {quotation.quotation_details?.length || 0} producto(s)
            </p>
          </div>
        </div>
      </Card>

      {/* ── Layout 2 columnas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">

        {/* Columna izquierda */}
        <div className="space-y-4 min-w-0">

          {/* Productos */}
          <Card className="!gap-0">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Productos
                </span>
                <Badge variant="secondary" className="font-mono">
                  {quotation.quotation_details?.length || 0} ítem(s)
                </Badge>
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
                      <TableHead className="text-center">IGV</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right pr-5 font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.quotation_details?.map((detail, i) => (
                      <TableRow key={detail.id} className="hover:bg-muted/20">
                        <TableCell className="pl-5 text-muted-foreground text-xs">{i + 1}</TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{detail.product.name}</p>
                          {detail.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{detail.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {Number(detail.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          {currency} {Number(detail.unit_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={!!detail.is_igv ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {!!detail.is_igv ? "Incluido" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          {currency} {Number(detail.subtotal).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums pr-5">
                          {currency} {Number(detail.total).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-6 px-5 py-3 bg-muted/30 border-t text-sm tabular-nums">
                <span className="text-muted-foreground">
                  Subtotal: <span className="font-medium text-foreground">{currency} {subtotal.toFixed(2)}</span>
                </span>
                <span className="text-muted-foreground">
                  IGV: <span className="font-medium text-foreground">{currency} {tax.toFixed(2)}</span>
                </span>
                <span className="font-bold text-base">
                  Total: <span className="text-primary">{currency} {total.toFixed(2)}</span>
                </span>
              </div>
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
              <TraceabilityTimeline entityType="quotation" entityId={quotation.id} />
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha */}
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
              <InfoRow label="Número">
                <span className="font-mono font-bold">{quotation.quotation_number}</span>
              </InfoRow>
              <InfoRow label="Estado">
                <Badge variant={statusVariant[quotation.status] ?? "secondary"} className="text-xs">
                  {quotation.status}
                </Badge>
              </InfoRow>
              <InfoRow label="Emisión">{formatDate(quotation.fecha_emision)}</InfoRow>
              <InfoRow label="Moneda">
                <Badge variant="outline">{quotation.currency}</Badge>
              </InfoRow>
              <InfoRow label="Tipo pago">
                <Badge variant={quotation.payment_type === "CONTADO" ? "default" : "secondary"} className="text-xs">
                  {quotation.payment_type}
                </Badge>
              </InfoRow>
              {quotation.payment_type === "CREDITO" && quotation.days && (
                <InfoRow label="Días crédito">{quotation.days} días</InfoRow>
              )}
              <InfoRow label="T. Entrega">{quotation.delivery_time}</InfoRow>
              <InfoRow label="Vigencia">{quotation.validity_time}</InfoRow>
              {quotation.tipo_cambio && (
                <InfoRow label={
                  <span className="flex items-center gap-1"><ArrowLeftRight className="h-3 w-3" />T/C SUNAT</span> as any
                }>
                  {quotation.tipo_cambio}
                </InfoRow>
              )}

              {/* Referencias */}
              {(quotation.order_purchase || quotation.order_service) && (
                <>
                  <Separator className="my-2" />
                  {quotation.order_purchase && (
                    <InfoRow label={
                      <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />O. Compra</span> as any
                    }>
                      <span className="font-mono text-xs">{quotation.order_purchase}</span>
                    </InfoRow>
                  )}
                  {quotation.order_service && (
                    <InfoRow label={
                      <span className="flex items-center gap-1"><FileCheck className="h-3 w-3" />O. Servicio</span> as any
                    }>
                      <span className="font-mono text-xs">{quotation.order_service}</span>
                    </InfoRow>
                  )}
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
                  <p className="font-semibold text-sm leading-snug">
                    {quotation.customer.business_name || quotation.customer.full_name}
                  </p>
                  {quotation.customer.number_document && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {quotation.customer.type_document} · {quotation.customer.number_document}
                    </p>
                  )}
                  {quotation.customer.phone && (
                    <p className="text-xs text-muted-foreground">{quotation.customer.phone}</p>
                  )}
                  {quotation.customer.email && (
                    <p className="text-xs text-muted-foreground truncate">{quotation.customer.email}</p>
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
                  <p className="font-semibold text-sm">{quotation.warehouse.name}</p>
                  {quotation.warehouse.address && (
                    <p className="text-xs text-muted-foreground">{quotation.warehouse.address}</p>
                  )}
                  {quotation.warehouse.phone && (
                    <p className="text-xs text-muted-foreground">{quotation.warehouse.phone}</p>
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
                  <p className="font-semibold text-sm">{quotation.user.name}</p>
                  <p className="text-xs text-muted-foreground">@{quotation.user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entrega */}
          <Card className="!gap-0">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                <MapPin className="h-3.5 w-3.5" />
                Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-2">
              {quotation.address && (
                <InfoRow label={
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Dirección</span> as any
                }>
                  <span className="text-xs">{quotation.address}</span>
                </InfoRow>
              )}
              {quotation.reference && (
                <InfoRow label="Referencia">
                  <span className="text-xs">{quotation.reference}</span>
                </InfoRow>
              )}
              {quotation.account_number && (
                <InfoRow label={
                  <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />N° Cuenta</span> as any
                }>
                  <span className="font-mono text-xs">{quotation.account_number}</span>
                </InfoRow>
              )}
              {!quotation.address && !quotation.reference && !quotation.account_number && (
                <p className="text-xs text-muted-foreground py-2">Sin datos de entrega</p>
              )}
            </CardContent>
          </Card>

          {/* Observaciones */}
          {quotation.observations && (
            <Card className="!gap-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                  <FileText className="h-3.5 w-3.5" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {quotation.observations}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <div className="flex flex-col gap-1 px-1 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />Creado {formatDateTime(quotation.created_at)}
            </span>
          </div>
        </div>
      </div>
    </FormWrapper>
  );
}
