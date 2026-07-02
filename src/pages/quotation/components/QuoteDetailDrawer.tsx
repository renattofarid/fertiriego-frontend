import { useEffect, useState } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatQuantityWithUnit, getDetailQuantityUnit } from "@/lib/utils";
import {
  ArrowLeftRight,
  Building2,
  Clock,
  CreditCard,
  FileText,
  Hash,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { findQuotationById } from "../lib/quotation.actions";
import type { QuotationResource } from "../lib/quotation.interface";

interface QuoteDetailDrawerProps {
  quoteId: number | null;
  initialQuotation?: QuotationResource | null;
  isOpen: boolean;
  onClose: () => void;
}

type BadgeVariant =
  | "yellow"
  | "green"
  | "red"
  | "gray"
  | "blue"
  | "default"
  | "secondary";

const getStatusVariant = (status?: string): BadgeVariant => {
  const normalizedStatus = status?.trim().toUpperCase();

  if (normalizedStatus === "APROBADA" || normalizedStatus === "APROBADO") {
    return "green";
  }
  if (normalizedStatus === "PENDIENTE") return "yellow";
  if (normalizedStatus === "RECHAZADA" || normalizedStatus === "RECHAZADO") {
    return "red";
  }
  if (normalizedStatus === "VENCIDA" || normalizedStatus === "VENCIDO") {
    return "gray";
  }
  if (normalizedStatus === "PROCESADA" || normalizedStatus === "PROCESADO") {
    return "blue";
  }

  return "secondary";
};

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{children}</span>
    </div>
  );
}

export default function QuoteDetailDrawer({
  quoteId,
  initialQuotation,
  isOpen,
  onClose,
}: QuoteDetailDrawerProps) {
  const [quotation, setQuotation] = useState<QuotationResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !quoteId) return;

    let isActive = true;
    const fetchQuotation = async () => {
      setQuotation(initialQuotation ?? null);
      setIsLoading(true);
      try {
        const response = await findQuotationById(quoteId);
        if (isActive) setQuotation(response.data);
      } catch (error) {
        console.error("Error al cargar cotizacion", error);
        if (isActive) setQuotation(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchQuotation();

    return () => {
      isActive = false;
    };
  }, [isOpen, quoteId, initialQuotation]);

  const handleClose = () => {
    onClose();
    setQuotation(null);
  };

  const currency =
    quotation?.currency === "PEN"
      ? "S/."
      : quotation?.currency === "USD"
        ? "$"
        : "EUR";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const subtotal =
    quotation?.quotation_details?.reduce(
      (sum, detail) => sum + Number(detail.subtotal || 0),
      0,
    ) ?? 0;
  const tax =
    quotation?.quotation_details?.reduce(
      (sum, detail) => sum + Number(detail.tax || 0),
      0,
    ) ?? 0;
  const total =
    quotation?.quotation_details?.reduce(
      (sum, detail) => sum + Number(detail.total || 0),
      0,
    ) ?? 0;

  return (
    <GeneralSheet
      open={isOpen}
      onClose={handleClose}
      title={
        quotation
          ? `Cotizacion ${quotation.quotation_number}`
          : "Cotizacion"
      }
      icon="FileText"
      className="overflow-y-auto p-2 !gap-0 w-full"
      size="4xl"
    >
      {!isLoading && !quotation && (
        <div className="px-5 py-8 text-sm text-muted-foreground">
          Selecciona una cotizacion para ver su detalle.
        </div>
      )}

      {quotation && (
        <div className="px-5 py-4 space-y-6">
          <div className="grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border">
            <div className="bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
              <p className="text-xl font-bold tabular-nums">
                {currency} {subtotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">IGV</p>
              <p className="text-xl font-bold text-muted-foreground tabular-nums">
                {currency} {tax.toFixed(2)}
              </p>
            </div>
            <div className="bg-background px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs text-muted-foreground">Total</p>
                <Badge
                  variant={getStatusVariant(quotation.status)}
                  className="text-xs"
                >
                  {quotation.status}
                </Badge>
              </div>
              <p className="text-xl font-bold text-primary tabular-nums">
                {currency} {total.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {quotation.quotation_details?.length || 0} producto(s)
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <SectionTitle icon={FileText} label="Documento" />
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Cotizacion</p>
                <p className="font-mono font-bold text-lg leading-tight">
                  {quotation.quotation_number}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant={getStatusVariant(quotation.status)}>
                  {quotation.status}
                </Badge>
                <Badge
                  variant={
                    quotation.payment_type === "CONTADO"
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {quotation.payment_type}
                </Badge>
              </div>
            </div>

            <Row label="Fecha de emision">
              {formatDate(quotation.fecha_emision)}
            </Row>
            <Row label="Moneda">
              <Badge variant="outline">{quotation.currency}</Badge>
            </Row>
            <Row label="Tiempo de entrega">{quotation.delivery_time}</Row>
            <Row label="Vigencia">{quotation.validity_time}</Row>
            {quotation.payment_type === "CREDITO" && quotation.days && (
              <Row label="Dias de credito">{quotation.days} dias</Row>
            )}
            {quotation.tipo_cambio && (
              <Row
                label={
                  <span className="flex items-center gap-1">
                    <ArrowLeftRight className="h-3 w-3" />
                    T/C SUNAT
                  </span>
                }
              >
                {quotation.tipo_cambio}
              </Row>
            )}

            {(quotation.order_purchase || quotation.order_service) && (
              <div className="flex gap-4 mt-3 pt-3 border-t">
                {quotation.order_purchase && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Orden de compra
                    </p>
                    <p className="text-sm font-semibold font-mono">
                      {quotation.order_purchase}
                    </p>
                  </div>
                )}
                {quotation.order_service && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Orden de servicio
                    </p>
                    <p className="text-sm font-semibold font-mono">
                      {quotation.order_service}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <SectionTitle icon={User} label="Partes" />
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2 shrink-0">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-sm">
                    {quotation.customer.business_name ||
                      quotation.customer.full_name}
                  </p>
                  {quotation.customer.number_document && (
                    <p className="text-xs text-muted-foreground">
                      {quotation.customer.type_document} -{" "}
                      {quotation.customer.number_document}
                    </p>
                  )}
                  {quotation.customer.phone && (
                    <p className="text-xs text-muted-foreground">
                      {quotation.customer.phone}
                    </p>
                  )}
                  {quotation.customer.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {quotation.customer.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pl-0.5">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Almacen</p>
                    <p className="text-sm font-medium">
                      {quotation.warehouse.name}
                    </p>
                    {quotation.warehouse.address && (
                      <p className="text-xs text-muted-foreground">
                        {quotation.warehouse.address}
                      </p>
                    )}
                    {quotation.warehouse.phone && (
                      <p className="text-xs text-muted-foreground">
                        {quotation.warehouse.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Responsable
                    </p>
                    <p className="text-sm font-medium">
                      {quotation.user.name}
                    </p>
                    {quotation.user.username && (
                      <p className="text-xs text-muted-foreground">
                        @{quotation.user.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <SectionTitle icon={MapPin} label="Entrega" />
            {quotation.address && (
              <Row label="Direccion">{quotation.address}</Row>
            )}
            {quotation.reference && (
              <Row label="Referencia">{quotation.reference}</Row>
            )}
            {quotation.account_number && (
              <Row
                label={
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Nro. Cuenta
                  </span>
                }
              >
                <span className="font-mono">{quotation.account_number}</span>
              </Row>
            )}
            {!quotation.address &&
              !quotation.reference &&
              !quotation.account_number && (
                <p className="text-sm text-muted-foreground">
                  Sin datos de entrega
                </p>
              )}
          </div>

          {quotation.quotation_details &&
            quotation.quotation_details.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionTitle
                    icon={Package}
                    label={`Productos - ${quotation.quotation_details.length}`}
                  />
                  <div className="space-y-0 divide-y">
                    {quotation.quotation_details.map((detail, index) => (
                      <div
                        key={detail.id}
                        className="flex justify-between items-start py-2.5 gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">
                              {index + 1}.
                            </span>
                            <p className="text-sm font-medium leading-snug">
                              {detail.product.name}
                            </p>
                          </div>
                          {detail.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                              {detail.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                            {formatQuantityWithUnit(
                              Number(detail.quantity),
                              getDetailQuantityUnit(detail),
                            )}{" "}
                            x {currency} {Number(detail.unit_price).toFixed(2)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 ml-4">
                            <Badge
                              variant={detail.is_igv ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              IGV {detail.is_igv ? "Incluido" : "No"}
                            </Badge>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              Subtotal {currency}{" "}
                              {Number(detail.subtotal).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold tabular-nums">
                            {currency} {Number(detail.total).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            IGV {currency} {Number(detail.tax).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          {quotation.observations && (
            <>
              <Separator />
              <div>
                <SectionTitle icon={FileText} label="Observaciones" />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {quotation.observations}
                </p>
              </div>
            </>
          )}

          <Separator />
          <TraceabilityTimeline
            entityType="quotation"
            entityId={quotation.id}
          />

          <div className="flex items-center gap-3 text-xs text-muted-foreground/60 pt-1">
            <Clock className="h-3 w-3" />
            <span>Creado {formatDateTime(quotation.created_at)}</span>
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
