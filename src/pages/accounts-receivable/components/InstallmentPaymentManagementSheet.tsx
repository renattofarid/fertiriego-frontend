"use client";

import { useEffect, useState } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Wallet, Trash2, Calendar, Receipt, DollarSign } from "lucide-react";
import type {
  SaleInstallmentResource,
  SalePaymentResource,
} from "@/pages/sale/lib/sale.interface";
import {
  getInstallmentPayments,
  deleteInstallmentPayment,
} from "../lib/accounts-receivable.actions";
import { createSalePayment } from "@/pages/sale/lib/sale.actions";
import { errorToast, successToast } from "@/lib/core.function";

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
  const [payments, setPayments] = useState<SalePaymentResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount_cash: "",
    amount_card: "",
    amount_yape: "",
    amount_plin: "",
    amount_deposit: "",
    amount_transfer: "",
    amount_other: "",
    observation: "",
  });

  const currency = "S/."; // Puedes hacerlo dinámico si es necesario

  useEffect(() => {
    if (open && installment) {
      fetchPayments();
    }
  }, [open, installment]);

  const fetchPayments = async () => {
    if (!installment) return;

    setIsLoading(true);
    try {
      const data = await getInstallmentPayments(installment.id);
      // Asegurarnos de que data sea un array
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      errorToast("Error al cargar los pagos");
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!installment || !paymentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteInstallmentPayment(installment.id, paymentToDelete);
      successToast("Pago eliminado correctamente");
      await fetchPayments();
      onSuccess();
      setOpenDeleteDialog(false);
      setPaymentToDelete(null);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al eliminar el pago");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateTotal = () => {
    return (
      parseFloat(formData.amount_cash || "0") +
      parseFloat(formData.amount_card || "0") +
      parseFloat(formData.amount_yape || "0") +
      parseFloat(formData.amount_plin || "0") +
      parseFloat(formData.amount_deposit || "0") +
      parseFloat(formData.amount_transfer || "0") +
      parseFloat(formData.amount_other || "0")
    );
  };

  const handleSubmitPayment = async () => {
    if (!installment) return;

    const total = calculateTotal();
    const pendingAmount = parseFloat(installment.pending_amount);

    if (total === 0) {
      errorToast("Debe ingresar al menos un monto de pago");
      return;
    }

    if (total > pendingAmount) {
      errorToast(
        `El monto total (${currency} ${total.toFixed(
          2
        )}) excede el monto pendiente (${currency} ${pendingAmount.toFixed(2)})`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createSalePayment(installment.id, {
        payment_date: formData.payment_date,
        amount_cash: parseFloat(formData.amount_cash || "0"),
        amount_card: parseFloat(formData.amount_card || "0"),
        amount_yape: parseFloat(formData.amount_yape || "0"),
        amount_plin: parseFloat(formData.amount_plin || "0"),
        amount_deposit: parseFloat(formData.amount_deposit || "0"),
        amount_transfer: parseFloat(formData.amount_transfer || "0"),
        amount_other: parseFloat(formData.amount_other || "0"),
        observation: formData.observation,
      });

      successToast("Pago registrado correctamente");

      // Reset form
      setFormData({
        payment_date: new Date().toISOString().split("T")[0],
        amount_cash: "",
        amount_card: "",
        amount_yape: "",
        amount_plin: "",
        amount_deposit: "",
        amount_transfer: "",
        amount_other: "",
        observation: "",
      });

      fetchPayments();
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al registrar el pago"
      );
    } finally {
      setIsSubmitting(false);
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

  const isPending = parseFloat(installment.pending_amount) > 0;

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title={`Gestionar Cuota ${installment.installment_number}`}
        icon={<Wallet className="h-5 w-5" />}
        className="overflow-y-auto w-full sm:max-w-3xl"
      >
        <div className="space-y-4 p-4">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Venta
                    </p>
                    <p className="text-lg font-bold">
                      {installment.sale_correlativo}
                    </p>
                  </div>
                  <Badge
                    variant={
                      installment.status === "PAGADO"
                        ? "default"
                        : installment.status === "VENCIDO"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-sm"
                  >
                    {installment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Monto Total</p>
                    <p className="text-lg font-bold">
                      {currency} {parseFloat(installment.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pagado</p>
                    <p className="text-lg font-bold text-green-600">
                      {currency}{" "}
                      {(
                        parseFloat(installment.amount) -
                        parseFloat(installment.pending_amount)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pendiente</p>
                    <p
                      className={`text-lg font-bold ${
                        isPending ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {currency}{" "}
                      {parseFloat(installment.pending_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Vence: {formatDate(installment.due_date)} (
                    {installment.due_days} días)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {isPending && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Registrar Nuevo Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Installment Info */}
                <div className="p-3 bg-muted/50 rounded-lg space-y-2 border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Monto de la Cuota
                    </span>
                    <span className="font-semibold">
                      {currency} {parseFloat(installment.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Monto Pendiente
                    </span>
                    <span className="font-semibold text-orange-600">
                      {currency}{" "}
                      {parseFloat(installment.pending_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Date */}
                <div>
                  <Label htmlFor="payment_date" className="text-sm">
                    Fecha de Pago
                  </Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      handleInputChange("payment_date", e.target.value)
                    }
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Métodos de Pago
                  </Label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="amount_cash" className="text-xs">
                        💵 Efectivo
                      </Label>
                      <Input
                        id="amount_cash"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_cash}
                        onChange={(e) =>
                          handleInputChange("amount_cash", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount_card" className="text-xs">
                        💳 Tarjeta
                      </Label>
                      <Input
                        id="amount_card"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_card}
                        onChange={(e) =>
                          handleInputChange("amount_card", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount_yape" className="text-xs">
                        📱 Yape
                      </Label>
                      <Input
                        id="amount_yape"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_yape}
                        onChange={(e) =>
                          handleInputChange("amount_yape", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount_plin" className="text-xs">
                        📱 Plin
                      </Label>
                      <Input
                        id="amount_plin"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_plin}
                        onChange={(e) =>
                          handleInputChange("amount_plin", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount_deposit" className="text-xs">
                        🏦 Depósito
                      </Label>
                      <Input
                        id="amount_deposit"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_deposit}
                        onChange={(e) =>
                          handleInputChange("amount_deposit", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount_transfer" className="text-xs">
                        🔄 Transferencia
                      </Label>
                      <Input
                        id="amount_transfer"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_transfer}
                        onChange={(e) =>
                          handleInputChange("amount_transfer", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="amount_other" className="text-xs">
                        💰 Otro
                      </Label>
                      <Input
                        id="amount_other"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_other}
                        onChange={(e) =>
                          handleInputChange("amount_other", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Total a Pagar</span>
                    <span
                      className={`text-lg font-bold ${
                        calculateTotal() >
                        parseFloat(installment.pending_amount)
                          ? "text-red-600"
                          : calculateTotal() > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {currency} {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  {calculateTotal() >
                    parseFloat(installment.pending_amount) && (
                    <p className="text-xs text-red-600 mt-2">
                      El total excede el monto pendiente
                    </p>
                  )}
                  {calculateTotal() > 0 &&
                    calculateTotal() <=
                      parseFloat(installment.pending_amount) && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Pendiente después del pago: {currency}{" "}
                        {(
                          parseFloat(installment.pending_amount) -
                          calculateTotal()
                        ).toFixed(2)}
                      </p>
                    )}
                </div>

                {/* Observation */}
                <div>
                  <Label htmlFor="observation" className="text-sm">
                    Observación (Opcional)
                  </Label>
                  <Textarea
                    id="observation"
                    value={formData.observation}
                    onChange={(e) =>
                      handleInputChange("observation", e.target.value)
                    }
                    placeholder="Ingrese una observación"
                    rows={2}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full"
                  onClick={handleSubmitPayment}
                  disabled={
                    isSubmitting ||
                    calculateTotal() === 0 ||
                    calculateTotal() > parseFloat(installment.pending_amount)
                  }
                >
                  {isSubmitting ? "Registrando..." : "Registrar Pago"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Historial de Pagos ({payments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando pagos...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay pagos registrados para esta cuota
                  </p>
                </div>
              ) : payments && payments.length > 0 ? (
                <div className="space-y-4">
                  {payments?.map((payment) => (
                    <Card
                      key={payment.id}
                      className="bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">
                              Pago #{payment.correlativo}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(payment.payment_date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-green-600">
                              {currency} {payment.total_paid.toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPaymentToDelete(payment.id);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div className="space-y-2 pt-3 border-t">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Desglose del Pago
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {payment.amount_cash > 0 && (
                              <div className="flex justify-between">
                                <span>💵 Efectivo</span>
                                <span className="font-medium">
                                  {currency} {payment.amount_cash.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {payment.amount_card > 0 && (
                              <div className="flex justify-between">
                                <span>💳 Tarjeta</span>
                                <span className="font-medium">
                                  {currency} {payment.amount_card.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {payment.amount_yape > 0 && (
                              <div className="flex justify-between">
                                <span>📱 Yape</span>
                                <span className="font-medium">
                                  {currency} {payment.amount_yape.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {payment.amount_plin > 0 && (
                              <div className="flex justify-between">
                                <span>📱 Plin</span>
                                <span className="font-medium">
                                  {currency} {payment.amount_plin.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {payment.amount_deposit > 0 && (
                              <div className="flex justify-between">
                                <span>🏦 Depósito</span>
                                <span className="font-medium">
                                  {currency} {payment.amount_deposit.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {payment.amount_transfer > 0 && (
                              <div className="flex justify-between">
                                <span>🔄 Transferencia</span>
                                <span className="font-medium">
                                  {currency}{" "}
                                  {payment.amount_transfer.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {payment.amount_other > 0 && (
                              <div className="flex justify-between">
                                <span>💰 Otro</span>
                                <span className="font-medium">
                                  {currency} {payment.amount_other.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>

                          {payment.observation && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                Observación
                              </p>
                              <p className="text-sm">{payment.observation}</p>
                            </div>
                          )}

                          <div className="pt-2 text-xs text-muted-foreground">
                            Registrado: {formatDateTime(payment.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay pagos registrados para esta cuota.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
