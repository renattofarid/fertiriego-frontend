"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Warehouse,
  Calendar,
  Package,
  ArrowLeft,
  Loader,
} from "lucide-react";
import type { QuotationResource } from "../lib/quotation.interface";
import { findQuotationById } from "../lib/quotation.actions";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { QUOTATION } from "../lib/quotation.interface";

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
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

    fetchQuotation();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const currency =
    quotation?.currency === "PEN"
      ? "S/."
      : quotation?.currency === "USD"
      ? "$"
      : "€";

  const { ICON } = QUOTATION;

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (!quotation) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cotización no encontrada</p>
          <Button
            onClick={() => navigate("/cotizaciones")}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <TitleComponent
            title={`Cotización ${quotation.quotation_number}`}
            subtitle="Detalle de la cotización"
            icon={ICON}
          />
          <Button onClick={() => navigate("/cotizaciones")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">N° Cotización</p>
                  <p className="font-mono font-semibold">
                    {quotation.quotation_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge>{quotation.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Emisión</p>
                  <p className="font-medium">
                    {formatDate(quotation.fecha_emision)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moneda</p>
                  <Badge variant="outline">{quotation.currency}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de Pago</p>
                  <Badge variant="secondary">{quotation.payment_type}</Badge>
                </div>
                {quotation.payment_type === "CREDITO" && quotation.days && (
                  <div>
                    <p className="text-xs text-muted-foreground">Días de Crédito</p>
                    <p className="font-medium">{quotation.days} días</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">
                    Tiempo de Entrega
                  </p>
                  <p className="font-medium">{quotation.delivery_time}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vigencia</p>
                  <p className="font-medium">{quotation.validity_time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-semibold text-lg">
                  {quotation.customer.business_name ||
                    quotation.customer.full_name}
                </p>
              </div>
              {quotation.customer.number_document && (
                <div>
                  <p className="text-xs text-muted-foreground">Documento</p>
                  <p className="font-medium">
                    {quotation.customer.number_document}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Almacén */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Almacén
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-semibold">{quotation.warehouse.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="text-sm">{quotation.warehouse.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dirección de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dirección de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="font-medium">{quotation.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Referencia</p>
                <p className="text-sm">{quotation.reference || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos */}
        {quotation.quotation_details &&
          quotation.quotation_details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos ({quotation.quotation_details.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotation.quotation_details.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{detail.product.name}</p>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Cantidad: {detail.quantity}</span>
                          <span>
                            P. Unit: {currency} {detail.unit_price}
                          </span>
                          <Badge
                            variant={detail.is_igv ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {detail.is_igv ? "Con IGV" : "Sin IGV"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {currency} {detail.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Subtotal: {currency} {detail.subtotal}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-2xl text-primary">
                      {currency}{" "}
                      {quotation.quotation_details
                        .reduce(
                          (sum, detail) => sum + parseFloat(detail.total),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Observaciones */}
        {quotation.observations && (
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{quotation.observations}</p>
            </CardContent>
          </Card>
        )}

        {/* Trazabilidad */}
        <TraceabilityTimeline entityType="quotation" entityId={quotation.id} />
      </div>
    </PageWrapper>
  );
}
