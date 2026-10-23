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
    payment_date: payment?.payment_date || new Date().toISOString().split("T")[0],
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
        payment_date: values.payment_date || new Date().toISOString().split("T")[0],
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount_cash"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Efectivo</FormLabel>
                  {pending !== undefined && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => fillRemaining("amount_cash")}
                    >
                      Completar saldo
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="number" step="any" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount_yape"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Yape</FormLabel>
                  {pending !== undefined && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => fillRemaining("amount_yape")}
                    >
                      Completar saldo
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="number" step="any" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount_plin"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Plin</FormLabel>
                  {pending !== undefined && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => fillRemaining("amount_plin")}
                    >
                      Completar saldo
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="number" step="any" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount_deposit"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Depósito</FormLabel>
                  {pending !== undefined && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => fillRemaining("amount_deposit")}
                    >
                      Completar saldo
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="number" step="any" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount_transfer"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Transferencia</FormLabel>
                  {pending !== undefined && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => fillRemaining("amount_transfer")}
                    >
                      Completar saldo
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="number" step="any" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total a Pagar:</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrecise(calculateTotal())}
            </span>
          </div>
          {pending !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              Saldo pendiente: {formatPrecise(pending)}
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
