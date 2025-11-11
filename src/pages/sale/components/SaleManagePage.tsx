"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSaleById } from "../lib/sale.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Eye } from "lucide-react";
import type { SaleInstallmentResource } from "../lib/sale.interface";
import InstallmentPaymentDialog from "./InstallmentPaymentDialog";
import InstallmentPaymentsSheet from "./InstallmentPaymentsSheet";

export default function SaleManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sale, isFinding, refetch } = useSaleById(Number(id));

  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPaymentsSheet, setOpenPaymentsSheet] = useState(false);

  const currency =
    sale?.currency === "PEN" ? "S/." : sale?.currency === "USD" ? "$" : "€";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePaymentSuccess = () => {
    refetch();
    setOpenPaymentDialog(false);
    setSelectedInstallment(null);
  };

  const handleOpenPayment = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentDialog(true);
  };

  const handleViewPayments = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentsSheet(true);
  };

  if (isFinding) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No se encontró la venta</p>
      </div>
    );
  }

  const isContado = sale.payment_type === "CONTADO";

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/ventas")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestionar Venta</h1>
            <p className="text-sm text-muted-foreground">
              {sale.full_document_number} - {sale.customer_fullname}
            </p>
          </div>
        </div>
        <Badge
          variant={
            sale.status === "PAGADA"
              ? "default"
              : sale.status === "REGISTRADO"
              ? "secondary"
              : "destructive"
          }
          className="text-lg px-4 py-2"
        >
          {sale.status}
        </Badge>
      </div>

      {/* Sale Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de la Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                {currency} {sale.total_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                {currency} {sale.total_paid.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
              <p
                className={`text-2xl font-bold ${
                  sale.current_amount === 0
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {currency} {sale.current_amount.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tipo de Pago</p>
              <Badge
                variant={
                  sale.payment_type === "CONTADO" ? "default" : "secondary"
                }
              >
                {sale.payment_type}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de Emisión</p>
              <p className="font-medium">{formatDate(sale.issue_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Almacén</p>
              <p className="font-medium">{sale.warehouse_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments Section */}
      {isContado ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-lg font-medium text-green-600">
                Venta al contado - Ya pagada
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Esta venta fue realizada al contado y no tiene cuotas pendientes
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Cuotas de Pago</span>
              <Badge variant="outline">
                {sale.installments?.length || 0} cuota(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!sale.installments || sale.installments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No hay cuotas registradas para esta venta
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sale.installments.map((installment) => {
                  const isPending = parseFloat(installment.pending_amount) > 0;
                  const isOverdue =
                    isPending &&
                    new Date(installment.due_date) < new Date() &&
                    installment.status === "VENCIDO";

                  return (
                    <div
                      key={installment.id}
                      className={`p-4 border rounded-lg ${
                        isOverdue ? "border-red-300 bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              Cuota {installment.installment_number}
                            </h3>
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
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                Fecha de Vencimiento
                              </p>
                              <p className="font-medium">
                                {formatDate(installment.due_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Monto</p>
                              <p className="font-medium">
                                {currency}{" "}
                                {parseFloat(installment.amount).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pendiente</p>
                              <p
                                className={`font-medium ${
                                  isPending
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {currency}{" "}
                                {parseFloat(installment.pending_amount).toFixed(
                                  2
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayments(installment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Pagos
                          </Button>
                          {isPending && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenPayment(installment)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Registrar Pago
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <InstallmentPaymentDialog
        open={openPaymentDialog}
        onClose={() => {
          setOpenPaymentDialog(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        currency={currency}
        onSuccess={handlePaymentSuccess}
      />

      {/* Payments Sheet */}
      <InstallmentPaymentsSheet
        open={openPaymentsSheet}
        onClose={() => {
          setOpenPaymentsSheet(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        currency={currency}
      />
    </div>
  );
}
