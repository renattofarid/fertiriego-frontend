"use client";

import { useEffect, useState } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Wallet, Plus, Trash2, Calendar, Receipt } from "lucide-react";
import type {
  SaleInstallmentResource,
  SalePaymentResource,
} from "@/pages/sale/lib/sale.interface";
import {
  getInstallmentPayments,
  deleteInstallmentPayment,
} from "../lib/accounts-receivable.actions";
import InstallmentPaymentDialog from "@/pages/sale/components/InstallmentPaymentDialog";
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
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      errorToast("Error al cargar los pagos");
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
      errorToast(
        error?.response?.data?.message || "Error al eliminar el pago"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePaymentSuccess = () => {
    fetchPayments();
    onSuccess();
    setOpenPaymentDialog(false);
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

          {/* Add Payment Button */}
          {isPending && (
            <Button
              className="w-full"
              onClick={() => setOpenPaymentDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
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
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
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
                                  {currency} {payment.amount_transfer.toFixed(2)}
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
              )}
            </CardContent>
          </Card>
        </div>
      </GeneralSheet>

      {/* Payment Dialog */}
      <InstallmentPaymentDialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        installment={installment}
        currency={currency}
        onSuccess={handlePaymentSuccess}
      />

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
