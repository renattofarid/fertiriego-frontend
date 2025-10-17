import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader } from "lucide-react";
import type { PurchaseInstallmentResource } from "../../lib/purchase.interface";

interface PurchaseInstallmentFormProps {
  installment?: PurchaseInstallmentResource | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function PurchaseInstallmentForm({
  installment,
  onSubmit,
  onCancel,
  isSubmitting,
}: PurchaseInstallmentFormProps) {
  const [formData, setFormData] = useState({
    due_days: installment?.due_days.toString() || "",
    amount: installment?.amount || "",
  });

  const form = useForm({
    defaultValues: formData,
  });

  useEffect(() => {
    if (installment) {
      const newData = {
        due_days: installment.due_days.toString(),
        amount: installment.amount,
      };
      setFormData(newData);
      form.reset(newData);
    }
  }, [installment, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setFormData({
        due_days: values.due_days || "",
        amount: values.amount || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      due_days: Number(formData.due_days),
      amount: Number(formData.amount),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="due_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Días de Vencimiento</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  variant="primary"
                  placeholder="Ej: 30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  variant="primary"
                  placeholder="0.00"
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
