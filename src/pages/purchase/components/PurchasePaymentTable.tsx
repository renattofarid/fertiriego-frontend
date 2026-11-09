import { useMemo } from "react";
import type { PurchasePaymentResource } from "../lib/purchase.interface";
import { usePurchasePaymentStore } from "../lib/purchase-payment.store";
import { errorToast, successToast } from "@/lib/core.function";
import {
  PaymentHistory,
  type PaymentHistoryItem,
} from "@/components/payments/PaymentHistory";

interface PurchasePaymentTableProps {
  payments: PurchasePaymentResource[];
  /** Monto original de la cuota */
  installmentAmount: number;
  currencySymbol?: string;
  onEdit: (paymentId: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const METHODS: { key: keyof PurchasePaymentResource; label: string }[] = [
  { key: "amount_cash", label: "Efectivo" },
  { key: "amount_yape", label: "Yape" },
  { key: "amount_plin", label: "Plin" },
  { key: "amount_deposit", label: "Depósito" },
  { key: "amount_transfer", label: "Transferencia" },
];

const toNumber = (value: unknown) => {
  const n = parseFloat(String(value ?? 0));
  return Number.isFinite(n) ? n : 0;
};

// Historial de pagos de una cuota de compra (la presentación es compartida
// con ventas / cuentas por cobrar en PaymentHistory).
export function PurchasePaymentTable({
  payments,
  installmentAmount,
  currencySymbol,
  onEdit,
  onRefresh,
  isLoading = false,
}: PurchasePaymentTableProps) {
  const { deletePayment } = usePurchasePaymentStore();

  const items = useMemo<PaymentHistoryItem[]>(
    () =>
      (payments ?? []).map((p) => ({
        id: p.id,
        code: p.correlativo,
        date: p.payment_date,
        reference: p.reference_number,
        bank: p.bank_number,
        observation: p.observation,
        total: toNumber(p.total_paid),
        methods: METHODS.filter(({ key }) => toNumber(p[key]) > 0).map(
          ({ key, label }) => ({ label, amount: toNumber(p[key]) }),
        ),
      })),
    [payments],
  );

  const handleDelete = async (id: number) => {
    try {
      await deletePayment(id);
      successToast("Pago eliminado exitosamente");
      onRefresh();
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al eliminar el pago");
    }
  };

  return (
    <PaymentHistory
      payments={items}
      installmentAmount={installmentAmount}
      currency={currencySymbol}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={handleDelete}
    />
  );
}
