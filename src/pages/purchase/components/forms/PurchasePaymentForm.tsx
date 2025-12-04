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
}

export function PurchasePaymentForm({
  payment,
  onSubmit,
  onCancel,
  isSubmitting,
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
    return (
      parseFloat(formData.amount_cash || "0") +
      parseFloat(formData.amount_yape || "0") +
      parseFloat(formData.amount_plin || "0") +
      parseFloat(formData.amount_deposit || "0") +
      parseFloat(formData.amount_transfer || "0")
    );
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
                <FormLabel>Efectivo</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01"  placeholder="0.00" {...field} />
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
                <FormLabel>Yape</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01"  placeholder="0.00" {...field} />
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
                <FormLabel>Plin</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01"  placeholder="0.00" {...field} />
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
                <FormLabel>Depósito</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01"  placeholder="0.00" {...field} />
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
                <FormLabel>Transferencia</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01"  placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-sidebar p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total a Pagar:</span>
            <span className="text-2xl font-bold text-primary">
              {calculateTotal().toFixed(2)}
            </span>
          </div>
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
