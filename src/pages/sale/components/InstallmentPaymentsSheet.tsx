"use client";

import { useEffect, useState } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  SaleInstallmentResource,
  SalePaymentResource,
} from "../lib/sale.interface";
import { getAllSalePayments } from "../lib/sale.actions";

interface InstallmentPaymentsSheetProps {
  open: boolean;
  onClose: () => void;
  installment: SaleInstallmentResource | null;
  currency: string;
}

export default function InstallmentPaymentsSheet({
  open,
  onClose,
  installment,
  currency,
}: InstallmentPaymentsSheetProps) {
  const [payments, setPayments] = useState<SalePaymentResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && installment) {
      fetchPayments();
    }
  }, [open, installment]);

  const fetchPayments = async () => {
    if (!installment) return;

    setIsLoading(true);
    try {
      const data = await getAllSalePayments(installment.id);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!installment) return null;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Pagos de Cuota ${installment.installment_number}`}
      icon={"CreditCard"}
      className="overflow-y-auto w-full p-4 sm:max-w-2xl"
    >
      <div className="space-y-6">
        {/* Installment Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Monto de la Cuota
            </span>
            <span className="font-semibold">
              {currency} {installment.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Monto Pendiente
            </span>
            <span
              className={`font-semibold ${
                installment.pending_amount === 0
                  ? "text-primary"
                  : "text-orange-600"
              }`}
            >
              {currency} {installment.pending_amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Fecha de Vencimiento
            </span>
            <span className="font-semibold">
              {formatDate(installment.due_date)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estado</span>
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
        </div>

        <Separator />

        {/* Payments List */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            HISTORIAL DE PAGOS ({payments.length})
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando pagos...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay pagos registrados para esta cuota
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        Pago #{String(payment.id).padStart(8, "0")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.payment_date)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {currency} {payment.total_paid.toFixed(2)}
                    </p>
                  </div>

                  <Separator className="my-3" />

                  {/* Payment Breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Desglose del Pago
                    </p>
                    {payment.amount_cash > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Efectivo</span>
                        <span className="font-medium">
                          {currency} {payment.amount_cash.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {payment.amount_card > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tarjeta</span>
                        <span className="font-medium">
                          {currency} {payment.amount_card.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {payment.amount_yape > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Yape</span>
                        <span className="font-medium">
                          {currency} {payment.amount_yape.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {payment.amount_plin > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Plin</span>
                        <span className="font-medium">
                          {currency} {payment.amount_plin.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {payment.amount_deposit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Depósito</span>
                        <span className="font-medium">
                          {currency} {payment.amount_deposit.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {payment.amount_transfer > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Transferencia</span>
                        <span className="font-medium">
                          {currency} {payment.amount_transfer.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {payment.amount_other > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Otro</span>
                        <span className="font-medium">
                          {currency} {payment.amount_other.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Observation */}
                  {payment.observation && (
                    <>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                          Observación
                        </p>
                        <p className="text-sm">{payment.observation}</p>
                      </div>
                    </>
                  )}

                  {/* Metadata */}
                  <Separator className="my-3" />
                  <div className="text-xs text-muted-foreground">
                    <p>Registrado: {formatDateTime(payment.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GeneralSheet>
  );
}
