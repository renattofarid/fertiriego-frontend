"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  User,
  Warehouse,
  Calendar,
  Package,
  ArrowLeft,
  Loader,
  FileText,
} from "lucide-react";
import type { OrderResource } from "../lib/order.interface";
import { findOrderById } from "../lib/order.actions";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { ORDER } from "../lib/order.interface";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await findOrderById(parseInt(id));
        setOrder(response.data);
      } catch (error) {
        console.error("Error al cargar pedido", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
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
    order?.currency === "PEN" ? "S/." : order?.currency === "USD" ? "$" : "€";

  const { ICON } = ORDER;

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Pedido no encontrado</p>
          <Button
            onClick={() => navigate("/pedidos")}
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
            title={`Pedido ${order.order_number}`}
            subtitle="Detalle del pedido"
            icon={ICON}
          />
          <Button onClick={() => navigate("/pedidos")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">N° Pedido</p>
                  <p className="font-mono font-semibold">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge>{order.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Pedido</p>
                  <p className="font-medium">{formatDate(order.order_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Fecha Entrega
                  </p>
                  <Badge variant="secondary">
                    {formatDate(order.order_delivery_date)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Fecha Vencimiento
                  </p>
                  <p className="font-medium">
                    {formatDate(order.order_expiry_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moneda</p>
                  <Badge variant="outline">{order.currency}</Badge>
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
                  {order.customer.business_name || order.customer.full_name}
                </p>
              </div>
              {order.customer.number_document && (
                <div>
                  <p className="text-xs text-muted-foreground">Documento</p>
                  <p className="font-medium">{order.customer.number_document}</p>
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
                <p className="font-semibold">{order.warehouse.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="text-sm">{order.warehouse.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dirección de Entrega y Cotización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Dirección de Entrega
                </p>
                <p className="font-medium">{order.address || "N/A"}</p>
              </div>
              {order.quotation && (
                <div>
                  <p className="text-xs text-muted-foreground">Cotización</p>
                  <Badge variant="outline" className="font-mono">
                    {order.quotation.quotation_number}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Productos */}
        {order.order_details && order.order_details.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({order.order_details.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_details.map((detail) => (
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
                    {order.order_details
                      .reduce((sum, detail) => sum + parseFloat(detail.total), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {order.observations && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.observations}</p>
            </CardContent>
          </Card>
        )}

        {/* Trazabilidad */}
        <TraceabilityTimeline entityType="order" entityId={order.id} />
      </div>
    </PageWrapper>
  );
}
