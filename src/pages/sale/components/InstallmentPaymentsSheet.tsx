"use client";

import { parseLocalDate } from "@/lib/utils";

import { useEffect, useState } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import {
  PaymentHistory,
  type PaymentHistoryItem,
} from "@/components/payments/PaymentHistory";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  SaleInstallmentResource,
  SalePaymentResource,
} from "../lib/sale.interface";
import { deletePayment, getAllSalePayments } from "../lib/sale.actions";
import { errorToast, successToast } from "@/lib/core.function";

const SALE_METHODS: { key: keyof SalePaymentResource; label: string }[] = [
  { key: "amount_cash", label: "Efectivo" },
  { key: "amount_card", label: "Tarjeta" },
  { key: "amount_yape", label: "Yape" },
  { key: "amount_plin", label: "Plin" },
  { key: "amount_deposit", label: "Depósito" },
  { key: "amount_transfer", label: "Transferencia" },
  { key: "amount_other", label: "Otro" },
];

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

  const handleDeletePayment = async (paymentId: number) => {
    if (!installment) return;

    try {
      await deletePayment(installment.id, paymentId);
      successToast("Pago eliminado correctamente");
      await fetchPayments();
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al eliminar el pago");
    }
  };

  const historyItems: PaymentHistoryItem[] = payments.map((p) => ({
    id: p.id,
    date: p.payment_date,
    reference: p.reference_number,
    bank: p.bank_number,
    observation: p.observation,
    registeredBy: p.user?.name,
    total: Number(p.total_paid) || 0,
    methods: SALE_METHODS.filter(({ key }) => Number(p[key]) > 0).map(
      ({ key, label }) => ({ label, amount: Number(p[key]) }),
    ),
  }));

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!installment) return null;

  return (
    <>
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
            <span className="font-semibold tabular-nums">
              {currency} {installment.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Monto Pendiente
            </span>
            <span
              className={`font-semibold tabular-nums ${
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

        {/* Historial de pagos */}
        <PaymentHistory
          payments={historyItems}
          installmentAmount={installment.amount}
          currency={currency}
          isLoading={isLoading}
          onDelete={handleDeletePayment}
        />
      </div>
      </GeneralSheet>

    </>
  );
}
