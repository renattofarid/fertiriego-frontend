"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "lucide-react";
import type { SaleInstallmentResource } from "@/pages/sale/lib/sale.interface";
import { deleteInstallmentPayment } from "../lib/accounts-receivable.actions";
import { createSalePayment } from "@/pages/sale/lib/sale.actions";
import { errorToast, matchCurrency, successToast } from "@/lib/core.function";
import { dateStringSchema } from "@/lib/core.schema";
import { format } from "date-fns";
import { useState } from "react";
import formatCurrency from "@/lib/formatCurrency";

const paymentFormSchema = z.object({
  payment_date: dateStringSchema("Fecha de Pago"),
  amount_cash: z.string().optional(),
  amount_card: z.string().optional(),
  amount_yape: z.string().optional(),
  amount_plin: z.string().optional(),
  amount_deposit: z.string().optional(),
  amount_transfer: z.string().optional(),
  amount_other: z.string().optional(),
  observation: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface InstallmentPaymentManagementSheetProps {
  open: boolean;
  onClose: () => void;
  installment: SaleInstallmentResource | null;
  onSuccess: () => void;
}

export default function InstallmentPaymentManagementSheet({
  open,
  onClose,
  installment,
  onSuccess,
}: InstallmentPaymentManagementSheetProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      payment_date: format(new Date(), "yyyy-MM-dd"),
      amount_cash: "",
      amount_card: "",
      amount_yape: "",
      amount_plin: "",
      amount_deposit: "",
      amount_transfer: "",
      amount_other: "",
      observation: "",
    },
  });

  const currency = matchCurrency(installment?.currency || "PEN");

  const { watch, reset } = form;
  const formValues = watch();

  useEffect(() => {
    if (open && installment) {
      reset({
        payment_date: format(new Date(), "yyyy-MM-dd"),
        amount_cash: "",
        amount_card: "",
        amount_yape: "",
        amount_plin: "",
        amount_deposit: "",
        amount_transfer: "",
        amount_other: "",
        observation: "",
      });
    }
  }, [open, installment, reset]);

  const handleDeletePayment = async () => {
    if (!installment || !paymentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteInstallmentPayment(installment.id, paymentToDelete);
      successToast("Pago eliminado correctamente");
      onSuccess();
      setOpenDeleteDialog(false);
      setPaymentToDelete(null);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al eliminar el pago");
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateTotal = () => {
    return (
      parseFloat(formValues.amount_cash || "0") +
      parseFloat(formValues.amount_card || "0") +
      parseFloat(formValues.amount_yape || "0") +
      parseFloat(formValues.amount_plin || "0") +
      parseFloat(formValues.amount_deposit || "0") +
      parseFloat(formValues.amount_transfer || "0") +
      parseFloat(formValues.amount_other || "0")
    );
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (!installment) return;

    const total = calculateTotal();
    const pendingAmount = installment.pending_amount;

    if (total === 0) {
      errorToast("Debe ingresar al menos un monto de pago");
      return;
    }

    if (total > pendingAmount) {
      errorToast(
        `El monto total (${formatCurrency(
          total
        )}) excede el monto pendiente (${formatCurrency(pendingAmount, {
          currencySymbol: currency,
        })})`
      );
      return;
    }

    try {
      await createSalePayment(installment.id, {
        payment_date: data.payment_date ?? format(new Date(), "yyyy-MM-dd"),
        amount_cash: parseFloat(data.amount_cash || "0"),
        amount_card: parseFloat(data.amount_card || "0"),
        amount_yape: parseFloat(data.amount_yape || "0"),
        amount_plin: parseFloat(data.amount_plin || "0"),
        amount_deposit: parseFloat(data.amount_deposit || "0"),
        amount_transfer: parseFloat(data.amount_transfer || "0"),
        amount_other: parseFloat(data.amount_other || "0"),
        observation: data.observation || "",
      });

      successToast("Pago registrado correctamente");
      reset();
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al registrar el pago"
      );
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

  if (!installment) return null;

  const isPending = installment.pending_amount > 0;
  const total = calculateTotal();
  const pendingAmount = installment.pending_amount;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title={`Gestionar Cuota ${installment.installment_number}`}
        icon={"Wallet"}
        size="4xl"
      >
        <div className="space-y-6">
          {/* Installment Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Venta</p>
                {/* <p className="font-semibold">{installment.sale_correlativo}</p> */}
              </div>
              <Badge
                variant={
                  installment.status === "PAGADO"
                    ? "default"
                    : installment.status === "VENCIDO"
                    ? "destructive"
                    : "secondary"
                }
              >
                {installment.status}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <span className="text-sm text-muted-foreground">
                  Monto Total
                </span>
                <p className="font-semibold">
                  {formatCurrency(installment.amount, {
                    currencySymbol: currency,
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pagado</span>
                <p className="font-semibold text-primary">
                  {formatCurrency(
                    installment.amount - installment.pending_amount,
                    {
                      currencySymbol: currency,
                    }
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pendiente</span>
                <p
                  className={`font-semibold ${
                    isPending ? "text-orange-600" : "text-primary"
                  }`}
                >
                  {formatCurrency(installment.pending_amount, {
                    currencySymbol: currency,
                  })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Vence: {formatDate(installment.due_date)} (
                {installment.due_days} días)
              </span>
            </div>
          </div>

          {/* Payment Form */}
          {isPending && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                Registrar Nuevo Pago
              </h3>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 p-4 border rounded-lg bg-muted/30"
                >
                  {/* Payment Date */}
                  <DatePickerFormField
                    control={form.control}
                    name="payment_date"
                    label="Fecha de Pago"
                    placeholder="Selecciona la fecha de pago"
                    disabledRange={{
                      after: new Date(),
                    }}
                  />

                  <Separator />

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Métodos de Pago</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="amount_cash"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Efectivo</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount_card"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Tarjeta</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount_yape"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Yape</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount_plin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Plin</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount_deposit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Depósito</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount_transfer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">
                              Transferencia
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount_other"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-sm">Otro</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        Total a Pagar
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          total > pendingAmount
                            ? "text-red-600"
                            : total > 0
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatCurrency(total, {
                          currencySymbol: currency,
                        })}
                      </span>
                    </div>
                    {total > pendingAmount && (
                      <p className="text-xs text-red-600 mt-2">
                        El total excede el monto pendiente
                      </p>
                    )}
                    {total > 0 && total <= pendingAmount && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Pendiente después del pago:{" "}
                        {formatCurrency(pendingAmount - total, {
                          currencySymbol: currency,
                        })}
                      </p>
                    )}
                  </div>

                  {/* Observation */}
                  <FormField
                    control={form.control}
                    name="observation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observación</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ingrese una observación (opcional)"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isSubmitting || total === 0 || total > pendingAmount
                    }
                  >
                    {isSubmitting ? "Registrando..." : "Registrar Pago"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </GeneralSheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pago será eliminado
              permanentemente y el monto pendiente de la cuota será ajustado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePayment}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
