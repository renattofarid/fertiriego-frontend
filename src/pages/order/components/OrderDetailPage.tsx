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
import {
  ShoppingCart,
  User,
  Warehouse,
  Calendar,
  Package,
  ArrowLeft,
  FileText,
  Activity,
} from "lucide-react";
import type { OrderResource } from "../lib/order.interface";
import { findOrderById } from "../lib/order.actions";
import TraceabilityTimeline from "@/components/TraceabilityTimeline";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { ORDER } from "../lib/order.interface";
import FormSkeleton from "@/components/FormSkeleton";
import { GroupFormSection } from "@/components/GroupFormSection";

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
    return <FormSkeleton />;
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

        {/* Sección 1: Información General */}
        <GroupFormSection
          title="Información General"
          icon={ShoppingCart}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <div>
            <p className="text-xs text-muted-foreground mb-1">N° Pedido</p>
            <p className="font-mono font-semibold">{order.order_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Estado</p>
            <Badge>{order.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Moneda</p>
            <Badge variant="outline">{order.currency}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fecha Pedido</p>
            <p className="font-medium">{formatDate(order.order_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fecha Entrega</p>
            <Badge variant="secondary">
              {formatDate(order.order_delivery_date)}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Fecha Vencimiento
            </p>
            <p className="font-medium">{formatDate(order.order_expiry_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <User className="h-3 w-3" />
              Cliente
            </p>
            <p className="font-semibold">
              {order.customer.business_name || order.customer.full_name}
            </p>
            {order.customer.number_document && (
              <p className="text-xs text-muted-foreground">
                {order.customer.number_document}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Warehouse className="h-3 w-3" />
              Almacén
            </p>
            <p className="font-semibold">{order.warehouse.name}</p>
            <p className="text-xs text-muted-foreground">
              {order.warehouse.address}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Dirección de Entrega
            </p>
            <p className="font-medium">{order.address || "N/A"}</p>
          </div>
          {order.quotation && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Cotización
              </p>
              <Badge variant="outline" className="font-mono">
                {order.quotation.quotation_number}
              </Badge>
            </div>
          )}
          {order.observations && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-xs text-muted-foreground mb-1">Observaciones</p>
              <p className="text-sm">{order.observations}</p>
            </div>
          )}
        </GroupFormSection>

        {/* Sección 2: Detalles de Productos (Tabla) */}
        {order.order_details && order.order_details.length > 0 && (
          <GroupFormSection
            title={`Productos (${order.order_details.length})`}
            icon={Package}
            cols={{ sm: 1 }}
          >
            <div className="col-span-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">P. Unitario</TableHead>
                    <TableHead className="text-center">IGV</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">
                        {detail.product.name}
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
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={5} className="text-right">
                      Total General:
                    </TableCell>
                    <TableCell className="text-right text-lg text-primary">
                      {currency}{" "}
                      {order.order_details
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
          </GroupFormSection>
        )}

        {/* Sección 3: Trazabilidad */}
        <GroupFormSection
          title="Trazabilidad"
          icon={Activity}
          cols={{ sm: 1 }}
        >
          <div className="col-span-full">
            <TraceabilityTimeline entityType="order" entityId={order.id} />
          </div>
        </GroupFormSection>
      </div>
    </PageWrapper>
  );
}
