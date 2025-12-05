"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Activity,
  Loader,
  FileText,
  Package,
  Warehouse,
  DollarSign,
} from "lucide-react";
import type {
  TraceabilityEntityType,
  TraceabilityFlowData,
  TraceabilityStep,
} from "@/lib/traceability/traceability.interface";
import { getTraceability } from "@/lib/traceability/traceability.actions";
import { errorToast } from "@/lib/core.function";

interface TraceabilityTimelineProps {
  entityType: TraceabilityEntityType;
  entityId: number;
}

export default function TraceabilityTimeline({
  entityType,
  entityId,
}: TraceabilityTimelineProps) {
  const [flowData, setFlowData] = useState<TraceabilityFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraceability = async () => {
      setIsLoading(true);
      try {
        const response = await getTraceability(entityType, entityId);
        setFlowData(response?.data || null);
      } catch (error) {
        console.error("Error al cargar trazabilidad", error);
        errorToast("Error al cargar la trazabilidad");
        setFlowData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (entityId) {
      fetchTraceability();
    }
  }, [entityType, entityId]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string | number, currency: string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency === "PEN" ? "PEN" : "USD",
    }).format(numAmount);
  };

  const getStepTypeColor = (
    stepType: string
  ): "secondary" | "outline" | "destructive" | "default" | "green" => {
    switch (stepType) {
      case "QUOTATION":
        return "outline";
      case "ORDER":
        return "secondary";
      case "SALE":
        return "green";
      default:
        return "default";
    }
  };

  const getStepTypeLabel = (stepType: string): string => {
    switch (stepType) {
      case "QUOTATION":
        return "Cotización";
      case "ORDER":
        return "Pedido";
      case "SALE":
        return "Venta";
      default:
        return stepType;
    }
  };

  const getStatusColor = (
    status: string
  ): "secondary" | "outline" | "destructive" | "default" | "green" => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pendiente")) return "outline";
    if (statusLower.includes("pagada") || statusLower.includes("completado"))
      return "green";
    if (statusLower.includes("cancelado") || statusLower.includes("anulado"))
      return "destructive";
    return "secondary";
  };

  const renderStep = (step: TraceabilityStep) => (
    <div
      key={`${step.step_type}-${step.step_number}`}
      className="relative flex gap-4 pb-6 border-l-2 border-muted pl-6 last:border-l-0 last:pb-0"
    >
      {/* Timeline dot */}
      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />

      {/* Step content */}
      <div className="flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant={getStepTypeColor(step.step_type)}>
              {getStepTypeLabel(step.step_type)}
            </Badge>
            <Badge variant={getStatusColor(step.status)}>{step.status}</Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDateTime(step.date)}
          </span>
        </div>

        {/* Document info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>
              {step.document_type
                ? `${step.document_type}: ${step.document_number}`
                : step.document_number}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {/* Customer */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Cliente</p>
              <p className="font-medium">{step.customer.name}</p>
            </div>
          </div>

          {/* Warehouse */}
          <div className="flex items-start gap-2">
            <Warehouse className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Almacén</p>
              <p className="font-medium">{step.warehouse.name}</p>
            </div>
          </div>

          {/* User */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Usuario</p>
              <p className="font-medium">{step.user.name}</p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Total</p>
              <p className="font-medium">
                {formatCurrency(step.total_amount, step.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        {step.products && step.products.length > 0 && (
          <div className="mt-3">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  Ver productos ({step.products.length}{" "}
                  {step.products.length === 1 ? "item" : "items"})
                </span>
              </summary>
              <div className="mt-2 space-y-2 pl-6">
                {step.products.map((product, idx) => (
                  <div
                    key={`${product.product_id}-${idx}`}
                    className="p-3 bg-muted/50 rounded-lg text-xs space-y-1"
                  >
                    <p className="font-medium">{product.product_name}</p>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <span>Cantidad: {product.quantity}</span>
                      <span>
                        P. Unit:{" "}
                        {formatCurrency(product.unit_price, step.currency)}
                      </span>
                      <span>
                        Subtotal:{" "}
                        {formatCurrency(product.subtotal, step.currency)}
                      </span>
                      <span>
                        Total: {formatCurrency(product.total, step.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Payment methods (only for sales) */}
        {step.payment_methods && (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs font-medium mb-2">Métodos de Pago</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {parseFloat(step.payment_methods.cash) > 0 && (
                <div>
                  <span className="text-muted-foreground">Efectivo: </span>
                  <span className="font-medium">
                    {formatCurrency(step.payment_methods.cash, step.currency)}
                  </span>
                </div>
              )}
              {parseFloat(step.payment_methods.card) > 0 && (
                <div>
                  <span className="text-muted-foreground">Tarjeta: </span>
                  <span className="font-medium">
                    {formatCurrency(step.payment_methods.card, step.currency)}
                  </span>
                </div>
              )}
              {parseFloat(step.payment_methods.yape) > 0 && (
                <div>
                  <span className="text-muted-foreground">Yape: </span>
                  <span className="font-medium">
                    {formatCurrency(step.payment_methods.yape, step.currency)}
                  </span>
                </div>
              )}
              {parseFloat(step.payment_methods.plin) > 0 && (
                <div>
                  <span className="text-muted-foreground">Plin: </span>
                  <span className="font-medium">
                    {formatCurrency(step.payment_methods.plin, step.currency)}
                  </span>
                </div>
              )}
              {parseFloat(step.payment_methods.deposit) > 0 && (
                <div>
                  <span className="text-muted-foreground">Depósito: </span>
                  <span className="font-medium">
                    {formatCurrency(
                      step.payment_methods.deposit,
                      step.currency
                    )}
                  </span>
                </div>
              )}
              {parseFloat(step.payment_methods.transfer) > 0 && (
                <div>
                  <span className="text-muted-foreground">
                    Transferencia:{" "}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(
                      step.payment_methods.transfer,
                      step.currency
                    )}
                  </span>
                </div>
              )}
              {parseFloat(step.payment_methods.other) > 0 && (
                <div>
                  <span className="text-muted-foreground">Otro: </span>
                  <span className="font-medium">
                    {formatCurrency(step.payment_methods.other, step.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trazabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!flowData || !flowData.steps || flowData.steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trazabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay información de trazabilidad disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Trazabilidad
          {flowData.flow_description && (
            <Badge variant="outline" className="ml-auto">
              {flowData.flow_description}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">{flowData.steps.map(renderStep)}</div>
      </CardContent>
    </Card>
  );
}
