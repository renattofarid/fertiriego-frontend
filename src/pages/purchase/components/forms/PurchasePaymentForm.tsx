import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Loader } from "lucide-react";
import type { PurchasePaymentResource } from "../../lib/purchase.interface";

interface PurchasePaymentFormProps {
  payment?: PurchasePaymentResource | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  /** Saldo pendiente exacto de la cuota (el backend guarda hasta 4 decimales) */
  pending?: number;
}

const AMOUNT_FIELDS = [
  "amount_cash",
  "amount_yape",
  "amount_plin",
  "amount_deposit",
  "amount_transfer",
] as const;

const AMOUNT_LABELS: {
  name: (typeof AMOUNT_FIELDS)[number];
  label: string;
}[] = [
  { name: "amount_cash", label: "Efectivo" },
  { name: "amount_yape", label: "Yape" },
  { name: "amount_plin", label: "Plin" },
  { name: "amount_deposit", label: "Depósito" },
  { name: "amount_transfer", label: "Transferencia" },
];

// Redondea a 4 decimales (precisión del backend) y muestra mínimo 2
const formatPrecise = (n: number) => {
  const r = Math.round(n * 1e4) / 1e4;
  const decimals = (String(r).split(".")[1] || "").length;
  return r.toFixed(Math.max(2, decimals));
};

export function PurchasePaymentForm({
  payment,
  onSubmit,
  onCancel,
  isSubmitting,
  pending,
}: PurchasePaymentFormProps) {
  const [formData, setFormData] = useState({
    payment_date: payment?.payment_date || format(new Date(), "yyyy-MM-dd"),
    reference_number: payment?.reference_number || "",
    bank_number: payment?.bank_number || "",
    amount_cash: payment?.amount_cash.toString() || "0",
    amount_yape: payment?.amount_yape.toString() || "0",
    amount_plin: payment?.amount_plin.toString() || "0",
    amount_deposit: payment?.amount_deposit.toString() || "0",
    amount_transfer: payment?.amount_transfer.toString() || "0",
    observation: payment?.observation || "",
  });

  const form = useForm({
    defaultValues: formData,
  });

  useEffect(() => {
    if (payment) {
      const newData = {
        payment_date: payment.payment_date,
        reference_number: payment.reference_number,
        bank_number: payment.bank_number,
        amount_cash: payment.amount_cash.toString(),
        amount_yape: payment.amount_yape.toString(),
        amount_plin: payment.amount_plin.toString(),
        amount_deposit: payment.amount_deposit.toString(),
        amount_transfer: payment.amount_transfer.toString(),
        observation: payment.observation,
      };
      setFormData(newData);
      form.reset(newData);
    }
  }, [payment, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setFormData({
        payment_date: values.payment_date || format(new Date(), "yyyy-MM-dd"),
        reference_number: values.reference_number || "",
        bank_number: values.bank_number || "",
        amount_cash: values.amount_cash || "0",
        amount_yape: values.amount_yape || "0",
        amount_plin: values.amount_plin || "0",
        amount_deposit: values.amount_deposit || "0",
        amount_transfer: values.amount_transfer || "0",
        observation: values.observation || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const calculateTotal = () => {
    const total = AMOUNT_FIELDS.reduce(
      (sum, key) => sum + (parseFloat(formData[key] || "0") || 0),
      0
    );
    return Math.round(total * 1e4) / 1e4;
  };

  // Completa un método de pago con lo que falta para cubrir el saldo exacto
  const fillRemaining = (name: (typeof AMOUNT_FIELDS)[number]) => {
    if (pending === undefined) return;
    const others = AMOUNT_FIELDS.filter((k) => k !== name).reduce(
      (sum, key) => sum + (parseFloat(formData[key] || "0") || 0),
      0
    );
    const remaining = Math.max(0, Math.round((pending - others) * 1e4) / 1e4);
    form.setValue(name, String(remaining), { shouldDirty: true });
  };

  const exceedsPending =
    pending !== undefined && calculateTotal() > pending + 0.00005;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      payment_date: formData.payment_date,
      reference_number: formData.reference_number,
      bank_number: formData.bank_number,
      amount_cash: Number(formData.amount_cash),
      amount_yape: Number(formData.amount_yape),
      amount_plin: Number(formData.amount_plin),
      amount_deposit: Number(formData.amount_deposit),
      amount_transfer: Number(formData.amount_transfer),
      observation: formData.observation,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DatePickerFormField
          control={form.control}
          name="payment_date"
          label="Fecha de Pago"
          placeholder="Seleccione la fecha"
          dateFormat="dd/MM/yyyy"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="reference_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Referencia</FormLabel>
              <FormControl>
                <Input  placeholder="Ej: OP-20251009-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Banco/Cuenta</FormLabel>
              <FormControl>
                <Input  placeholder="Ej: 4567891230" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Monto por método de pago</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AMOUNT_LABELS.map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex min-h-5 items-center justify-between gap-2">
                      <FormLabel>{label}</FormLabel>
                      {pending !== undefined && (
                        <button
                          type="button"
                          className="rounded-sm text-xs text-primary underline-offset-4 transition-opacity active:opacity-70 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          onClick={() => fillRemaining(name)}
                        >
                          Completar saldo
                        </button>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={0}
                        placeholder="0.00"
                        className="tabular-nums"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            exceedsPending
              ? "border-destructive/50 bg-destructive/10"
              : "bg-muted"
          }`}
          aria-live="polite"
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-base font-semibold">Total a pagar</span>
            <span
              className={`text-2xl font-bold tabular-nums ${
                exceedsPending ? "text-destructive" : "text-primary"
              }`}
            >
              {formatPrecise(calculateTotal())}
            </span>
          </div>
          {pending !== undefined && (
            <p
              className={`mt-1 text-xs tabular-nums ${
                exceedsPending ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {exceedsPending
                ? `Excede el saldo pendiente (${formatPrecise(pending)})`
                : `Saldo pendiente: ${formatPrecise(pending)}`}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones del pago..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="active:scale-[0.97] transition-[color,background-color,transform] duration-150 ease-out motion-reduce:transform-none"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="active:scale-[0.97] transition-[color,background-color,transform] duration-150 ease-out motion-reduce:transform-none"
          >
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
