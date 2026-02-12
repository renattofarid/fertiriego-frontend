"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, MapPin, Package, ArrowLeft, FileCheck } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { QuotationResource } from "../lib/quotation.interface";
import { findQuotationById } from "../lib/quotation.actions";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";
import PageWrapper from "@/components/PageWrapper";
import { QUOTATION } from "../lib/quotation.interface";
import FormSkeleton from "@/components/FormSkeleton";
import TitleFormComponent from "@/components/TitleFormComponent";

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { ROUTE, ICON } = QUOTATION;

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

  if (isLoading) {
    return <FormSkeleton />;
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
          <TitleFormComponent
            title={`Cotización ${quotation.quotation_number}`}
            mode="detail"
            backRoute={ROUTE}
            icon={ICON}
          />
        </div>

        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 2, md: 3, lg: 4 }}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">N° Cotización</p>
            <p className="font-mono font-semibold">
              {quotation.quotation_number}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge>{quotation.status}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fecha Emisión</p>
            <p className="font-medium">{formatDate(quotation.fecha_emision)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Moneda</p>
            <Badge variant="outline">{quotation.currency}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tipo de Pago</p>
            <Badge variant="secondary">{quotation.payment_type}</Badge>
          </div>
          {quotation.payment_type === "CREDITO" && quotation.days && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Días de Crédito</p>
              <p className="font-medium">{quotation.days} días</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tiempo de Entrega</p>
            <p className="font-medium">{quotation.delivery_time}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Vigencia</p>
            <p className="font-medium">{quotation.validity_time}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-semibold">
              {quotation.customer.business_name || quotation.customer.full_name}
            </p>
          </div>
          {quotation.customer.number_document && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Doc. Cliente</p>
              <p className="font-medium">
                {quotation.customer.number_document}
              </p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Almacén</p>
            <p className="font-semibold">{quotation.warehouse.name}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-xs text-muted-foreground">Dir. Almacén</p>
            <p className="text-sm">{quotation.warehouse.address}</p>
          </div>
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection title="Detalles" icon={Package} cols={{ sm: 1 }}>
          {/* Dirección de Entrega */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Dirección de Entrega
              </p>
              <p className="font-medium">{quotation.address || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Referencia</p>
              <p className="text-sm">{quotation.reference || "N/A"}</p>
            </div>
          </div>

          {/* Productos */}
          {quotation.quotation_details &&
            quotation.quotation_details.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold">
                  Productos ({quotation.quotation_details.length})
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">P. Unit</TableHead>
                        <TableHead className="text-center">IGV</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotation.quotation_details.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {detail.product.name}
                              </p>
                              {detail.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {detail.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {detail.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {currency} {detail.unit_price}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={!detail.is_igv ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {!detail.is_igv ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {currency} {detail.subtotal}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {currency} {detail.total}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-bold">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-primary">
                          {currency}{" "}
                          {quotation.quotation_details
                            .reduce(
                              (sum, detail) => sum + parseFloat(detail.total),
                              0,
                            )
                            .toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

          {/* Observaciones */}
          {quotation.observations && (
            <div className="space-y-1 pt-4 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileCheck className="h-3 w-3" />
                Observaciones
              </p>
              <p className="text-sm">{quotation.observations}</p>
            </div>
          )}
        </GroupFormSection>

        {/* Trazabilidad */}
        <TraceabilityTimeline entityType="quotation" entityId={quotation.id} />
      </div>
    </PageWrapper>
  );
}
