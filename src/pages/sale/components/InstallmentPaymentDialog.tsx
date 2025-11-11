"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SaleInstallmentResource } from "../lib/sale.interface";
import { createSalePayment } from "../lib/sale.actions";
import { errorToast, successToast } from "@/lib/core.function";

interface InstallmentPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  installment: SaleInstallmentResource | null;
  currency: string;
  onSuccess: () => void;
}

export default function InstallmentPaymentDialog({
  open,
  onClose,
  installment,
  currency,
  onSuccess,
}: InstallmentPaymentDialogProps) {
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

  const handleSubmit = async () => {
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

      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al registrar el pago: "
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!installment) return null;

  const total = calculateTotal();
  const pendingAmount = parseFloat(installment.pending_amount);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Registrar Pago - Cuota {installment.installment_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Installment Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Monto de la Cuota
              </span>
              <span className="font-semibold">
                {currency} {parseFloat(installment.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Monto Pendiente
              </span>
              <span className="font-semibold text-orange-600">
                {currency} {pendingAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <Label htmlFor="payment_date">Fecha de Pago</Label>
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
            <Label>Métodos de Pago</Label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount_cash" className="text-sm">
                  Efectivo
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
                <Label htmlFor="amount_card" className="text-sm">
                  Tarjeta
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
                <Label htmlFor="amount_yape" className="text-sm">
                  Yape
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
                <Label htmlFor="amount_plin" className="text-sm">
                  Plin
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
                <Label htmlFor="amount_deposit" className="text-sm">
                  Depósito
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
                <Label htmlFor="amount_transfer" className="text-sm">
                  Transferencia
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
                <Label htmlFor="amount_other" className="text-sm">
                  Otro
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
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total a Pagar</span>
              <span
                className={`text-xl font-bold ${
                  total > pendingAmount ? "text-red-600" : "text-green-600"
                }`}
              >
                {currency} {total.toFixed(2)}
              </span>
            </div>
            {total > pendingAmount && (
              <p className="text-sm text-red-600 mt-2">
                El total excede el monto pendiente
              </p>
            )}
            {total > 0 && total <= pendingAmount && (
              <p className="text-sm text-muted-foreground mt-2">
                Pendiente después del pago: {currency}{" "}
                {(pendingAmount - total).toFixed(2)}
              </p>
            )}
          </div>

          {/* Observation */}
          <div>
            <Label htmlFor="observation">Observación</Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => handleInputChange("observation", e.target.value)}
              placeholder="Ingrese una observación (opcional)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || total === 0 || total > pendingAmount}
          >
            {isSubmitting ? "Registrando..." : "Registrar Pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
