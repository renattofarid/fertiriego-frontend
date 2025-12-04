import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import { errorToast, successToast } from "@/lib/core.function";

interface PurchaseInstallmentModalProps {
  open: boolean;
  onClose: () => void;
  purchaseId: number;
  installmentId?: number | null;
}

export function PurchaseInstallmentModal({
  open,
  onClose,
  purchaseId,
  installmentId,
}: PurchaseInstallmentModalProps) {
  const {
    installment,
    fetchInstallment,
    createInstallment,
    updateInstallment,
    isSubmitting,
    resetInstallment,
  } = usePurchaseInstallmentStore();

  const [formData, setFormData] = useState({
    due_days: "",
    amount: "",
  });

  const form = useForm({
    defaultValues: {
      due_days: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (installmentId) {
      fetchInstallment(installmentId);
    } else {
      resetInstallment();
      setFormData({
        due_days: "",
        amount: "",
      });
      form.reset({
        due_days: "",
        amount: "",
      });
    }
  }, [installmentId, fetchInstallment, resetInstallment, form]);

  useEffect(() => {
    if (installment && installmentId) {
      const newFormData = {
        due_days: installment.due_days.toString(),
        amount: installment.amount,
      };
      setFormData(newFormData);
      form.reset(newFormData);
    }
  }, [installment, installmentId, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setFormData({
        due_days: values.due_days || "",
        amount: values.amount || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.due_days || !formData.amount) {
      errorToast("Por favor complete todos los campos");
      return;
    }

    try {
      if (installmentId) {
        await updateInstallment(installmentId, {
          due_days: Number(formData.due_days),
          amount: Number(formData.amount),
        });
        successToast("Cuota actualizada exitosamente");
      } else {
        await createInstallment({
          purchase_id: purchaseId,
          due_days: Number(formData.due_days),
          amount: Number(formData.amount),
        });
        successToast("Cuota agregada exitosamente");
      }

      onClose();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ||
          `Error al ${installmentId ? "actualizar" : "agregar"} la cuota`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {installmentId ? "Editar Cuota" : "Agregar Cuota"}
          </DialogTitle>
        </DialogHeader>

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
                      
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Loader
                  className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
                />
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
