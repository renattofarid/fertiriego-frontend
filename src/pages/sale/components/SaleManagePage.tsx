"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSaleById } from "../lib/sale.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  Receipt,
  Wallet,
  CreditCard,
  FileText,
  User,
  Warehouse,
  Calendar,
} from "lucide-react";
import { SALE, type SaleInstallmentResource } from "../lib/sale.interface";
import InstallmentPaymentDialog from "./InstallmentPaymentDialog";
import InstallmentPaymentsSheet from "./InstallmentPaymentsSheet";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import TitleFormComponent from "@/components/TitleFormComponent";

export default function SaleManagePage() {
  const { id } = useParams<{ id: string }>();
  const { data: sale, isFinding, refetch } = useSaleById(Number(id));
  const { ROUTE } = SALE;
  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPaymentsSheet, setOpenPaymentsSheet] = useState(false);

  const currency =
    sale?.currency === "PEN" ? "S/." : sale?.currency === "USD" ? "$" : "€";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePaymentSuccess = () => {
    refetch();
    setOpenPaymentDialog(false);
    setSelectedInstallment(null);
  };

  const handleOpenPayment = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentDialog(true);
  };

  const handleViewPayments = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentsSheet(true);
  };

  if (isFinding) {
    return <FormSkeleton />;
  }

  if (!sale) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center h-64">
          <p>No se encontró la venta</p>
        </div>
      </FormWrapper>
    );
  }

  const isContado = sale.payment_type === "CONTADO";

  return (
    <FormWrapper>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <TitleFormComponent
            title={`Gestionar Venta #${sale.full_document_number}`}
            mode="detail"
            // subtitle={`${sale.full_document_number} - ${sale.customer_fullname}`}
            icon={"CreditCard"}
            backRoute={ROUTE}
          />
        </div>
        <Badge
          variant={
            sale.status === "PAGADA"
              ? "default"
              : sale.status === "REGISTRADO"
                ? "secondary"
                : sale.status === "PARCIAL"
                  ? "outline"
                  : "destructive"
          }
          className="text-sm px-3"
        >
          {sale.status}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Card */}
        <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Total
                </p>
                <p className="text-2xl font-bold text-muted-foreground truncate">
                  {currency} {sale.total_amount.toFixed(2)}
                </p>
              </div>
              <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagado Card */}
        <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Pagado
                </p>
                <p className="text-2xl font-bold text-primary truncate">
                  {currency}{" "}
                  {sale.total_paid > 0
                    ? sale.total_paid.toFixed(2)
                    : (sale.total_amount - sale.current_amount).toFixed(2)}
                </p>
              </div>
              <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendiente Card */}
        <Card
          className={`border-none transition-colors !p-0 ${
            sale.current_amount === 0
              ? "bg-primary/5 hover:bg-primary/10"
              : "bg-destructive/5 hover:bg-destructive/10"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Pendiente
                </p>
                <p
                  className={`text-2xl font-bold truncate ${
                    sale.current_amount === 0
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {currency} {sale.current_amount.toFixed(2)}
                </p>
              </div>
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  sale.current_amount === 0
                    ? "bg-primary/10"
                    : "bg-destructive/10"
                }`}
              >
                <CreditCard
                  className={`h-5 w-5 ${
                    sale.current_amount === 0
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del Documento */}
      <Card className="!gap-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información del Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tipo de Documento</p>
              <p className="font-semibold">{sale.document_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Número</p>
              <p className="font-mono font-bold">{sale.full_document_number}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de Emisión
              </p>
              <p className="font-medium">{formatDate(sale.issue_date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tipo de Pago</p>
              <Badge
                variant={
                  sale.payment_type === "CONTADO" ? "default" : "secondary"
                }
              >
                {sale.payment_type === "CONTADO" ? "CONTADO" : "CRÉDITO"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cliente y Almacén */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Nombre Completo</p>
              <p className="font-semibold">{sale.customer_fullname}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Almacén
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-semibold">{sale.warehouse_name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cuotas Section */}
      {isContado ? (
        <Card className="!gap-0">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg font-semibold mb-1">Venta al Contado</p>
              <p className="text-sm text-muted-foreground">
                Esta venta fue realizada al contado y no tiene cuotas pendientes
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="!gap-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cuotas de Pago
              </span>
              <Badge variant="outline">
                {sale.installments?.length || 0} cuota(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!sale.installments || sale.installments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No hay cuotas registradas para esta venta
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sale.installments.map((installment) => {
                  const isPending = installment.pending_amount > 0;
                  const isOverdue =
                    isPending &&
                    new Date(installment.due_date) < new Date() &&
                    installment.status === "VENCIDO";

                  return (
                    <div
                      key={installment.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isOverdue
                          ? "border-destructive/30 bg-destructive/5"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="font-semibold">
                              Cuota {installment.installment_number}
                            </Badge>
                            <Badge
                              variant={
                                installment.status === "PAGADA"
                                  ? "default"
                                  : installment.status === "REGISTRADO"
                                    ? "secondary"
                                    : installment.status === "PARCIAL"
                                      ? "outline"
                                      : "destructive"
                              }
                            >
                              {installment.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Vencimiento
                              </p>
                              <p className="font-medium">
                                {formatDate(installment.due_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Monto
                              </p>
                              <p className="font-semibold">
                                {currency} {installment.amount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Pendiente
                              </p>
                              <p
                                className={`font-semibold ${
                                  isPending
                                    ? "text-destructive"
                                    : "text-primary"
                                }`}
                              >
                                {currency}{" "}
                                {installment.pending_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayments(installment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Pagos
                          </Button>
                          {isPending && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenPayment(installment)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <InstallmentPaymentDialog
        open={openPaymentDialog}
        onClose={() => {
          setOpenPaymentDialog(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        currency={currency}
        onSuccess={handlePaymentSuccess}
      />

      {/* Payments Sheet */}
      <InstallmentPaymentsSheet
        open={openPaymentsSheet}
        onClose={() => {
          setOpenPaymentsSheet(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        currency={currency}
      />
    </FormWrapper>
  );
}
