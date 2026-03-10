import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseStore } from "../lib/purchase.store";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PackageOpen,
  CreditCard,
  Wallet,
  Pencil,
  FileText,
} from "lucide-react";
import { PurchaseDetailTable } from "./PurchaseDetailTable";
import { InstallmentPaymentsSheet } from "./sheets/InstallmentPaymentsSheet";
import { InstallmentTimeline } from "./InstallmentTimeline";
import {
  PURCHASE,
  type PurchaseInstallmentResource,
} from "../lib/purchase.interface";
import { errorToast, successToast } from "@/lib/core.function";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GroupFormSection } from "@/components/GroupFormSection";
import { parse } from "date-fns";

export const PurchaseDetailViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedInstallment, setSelectedInstallment] =
    useState<PurchaseInstallmentResource | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const { ROUTE } = PURCHASE;
  const { purchase, fetchPurchase, isFinding } = usePurchaseStore();
  const { details, fetchDetails } = usePurchaseDetailStore();
  const { installments, fetchInstallments, updateInstallment } =
    usePurchaseInstallmentStore();

  useEffect(() => {
    if (!id) {
      navigate("/compras");
      return;
    }
    fetchPurchase(Number(id));
    fetchDetails(Number(id));
    fetchInstallments(Number(id));
  }, [id, navigate]);

  const handleEditPurchase = () => {
    if (purchase) {
      navigate(`/compras/actualizar/${purchase.id}`);
    }
  };

  const handleViewInstallmentPayments = (
    installment: PurchaseInstallmentResource,
  ) => {
    setSelectedInstallment(installment);
    setIsPaymentSheetOpen(true);
  };

  const handleSyncInstallment = async (
    installmentId: number,
    newAmount: number,
  ) => {
    if (!purchase) return;

    try {
      await updateInstallment(installmentId, {
        amount: Number(newAmount.toFixed(2)),
      });
      successToast("Cuota sincronizada exitosamente");
      fetchInstallments(Number(id));
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al sincronizar la cuota",
      );
    }
  };

  const shouldShowSyncButton = (installment: PurchaseInstallmentResource) => {
    if (!purchase) return false;
    const isCash = purchase.payment_type === "CONTADO";
    const hasNoPayments =
      parseFloat(installment.pending_amount) === parseFloat(installment.amount);
    const hasDifference =
      Math.abs(
        parseFloat(installment.amount) - parseFloat(purchase.total_amount),
      ) > 0.01;
    return isCash && hasNoPayments && hasDifference;
  };

  if (isFinding) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title="Detalle de Compra"
          mode="detail"
          icon="PackageOpen"
          backRoute={ROUTE}
        />
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!purchase) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title="Detalle de Compra"
          mode="detail"
          icon="PackageOpen"
          backRoute={ROUTE}
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Compra no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TitleFormComponent
              title={`Compra ${purchase.correlativo}`}
              mode="detail"
              icon="PackageOpen"
              backRoute={ROUTE}
            />
          </div>
          <Button onClick={handleEditPurchase} variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 2, md: 3, lg: 4 }}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Correlativo</p>
            <p className="font-semibold text-lg">{purchase.correlativo}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Proveedor</p>
            <p className="font-semibold">{purchase.supplier_fullname}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Almacén</p>
            <p className="font-semibold">{purchase.warehouse_name || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Usuario</p>
            <p className="font-semibold">{purchase.user_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tipo de Documento</p>
            <p className="font-semibold">{purchase.document_type}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Número de Documento</p>
            <p className="font-semibold font-mono">
              {purchase.document_number}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fecha de Emisión</p>
            <p className="font-semibold">
              {parse(
                purchase.issue_date,
                "yyyy-MM-dd",
                new Date(),
              ).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tipo de Pago</p>
            <Badge
              variant={
                purchase.payment_type === "CONTADO" ? "default" : "secondary"
              }
            >
              {purchase.payment_type}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Moneda</p>
            <p className="font-semibold">
              {purchase.currency === "PEN"
                ? "Soles (S/.)"
                : purchase.currency === "USD"
                  ? "Dólares ($)"
                  : "Euros (€)"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-bold text-2xl text-primary">
              {purchase.currency === "PEN"
                ? "S/."
                : purchase.currency === "USD"
                  ? "$"
                  : "€"}
              {parseFloat(purchase.total_amount).toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Saldo Pendiente</p>
            <p className="font-bold text-2xl text-orange-600">
              {purchase.currency === "PEN"
                ? "S/."
                : purchase.currency === "USD"
                  ? "$"
                  : "€"}
              {parseFloat(purchase.current_amount).toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge
              variant={
                purchase.status === "PAGADA"
                  ? "default"
                  : purchase.status === "CANCELADO"
                    ? "destructive"
                    : "secondary"
              }
            >
              {purchase.status}
            </Badge>
          </div>
          {purchase.observations && (
            <div className="space-y-1 md:col-span-3 lg:col-span-4">
              <p className="text-xs text-muted-foreground">Observaciones</p>
              <p className="text-sm bg-muted p-3 rounded-md">
                {purchase.observations}
              </p>
            </div>
          )}
        </GroupFormSection>

        {/* Tabs de Detalles, Cuotas y Pagos */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <PackageOpen className="h-4 w-4" />
              Detalles ({details?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="installments"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Cuotas ({installments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Resumen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <GroupFormSection
              title="Detalles de la Compra"
              icon={PackageOpen}
              cols={{ sm: 1 }}
            >
              <PurchaseDetailTable
                details={details || []}
                onEdit={() => {}}
                onRefresh={() => {
                  fetchDetails(Number(id));
                  fetchPurchase(Number(id));
                }}
                isPurchasePaid={purchase?.status === "PAGADO"}
              />
            </GroupFormSection>
          </TabsContent>

          <TabsContent value="installments" className="mt-4">
            <GroupFormSection
              title="Cuotas de la Compra"
              icon={CreditCard}
              cols={{ sm: 1 }}
            >
              <InstallmentTimeline
                installments={installments || []}
                currency={purchase.currency}
                purchaseTotalAmount={purchase.total_amount}
                onViewPayments={handleViewInstallmentPayments}
                onSync={handleSyncInstallment}
                shouldShowSync={shouldShowSyncButton}
              />
            </GroupFormSection>
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <GroupFormSection
              title="Resumen Financiero"
              icon={Wallet}
              cols={{ sm: 1, md: 2, lg: 3 }}
            >
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Total de la Compra
                </p>
                <p className="font-bold text-2xl text-primary">
                  {purchase.currency === "PEN"
                    ? "S/."
                    : purchase.currency === "USD"
                      ? "$"
                      : "€"}{" "}
                  {parseFloat(purchase.total_amount).toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Pagado</p>
                <p className="font-bold text-2xl text-green-600">
                  {purchase.currency === "PEN"
                    ? "S/."
                    : purchase.currency === "USD"
                      ? "$"
                      : "€"}{" "}
                  {(
                    parseFloat(purchase.total_amount) -
                    parseFloat(purchase.current_amount)
                  ).toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Saldo Pendiente</p>
                <p className="font-bold text-2xl text-orange-600">
                  {purchase.currency === "PEN"
                    ? "S/."
                    : purchase.currency === "USD"
                      ? "$"
                      : "€"}{" "}
                  {parseFloat(purchase.current_amount).toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <PackageOpen className="h-3 w-3" />
                  Productos
                </p>
                <p className="font-bold text-3xl">{details?.length || 0}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Cuotas
                </p>
                <p className="font-bold text-3xl">
                  {installments?.length || 0}
                </p>
              </div>
            </GroupFormSection>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sheet de Pagos */}
      <InstallmentPaymentsSheet
        open={isPaymentSheetOpen}
        onClose={() => {
          setIsPaymentSheetOpen(false);
          setSelectedInstallment(null);
          if (id) {
            fetchInstallments(Number(id));
            fetchPurchase(Number(id));
          }
        }}
        installment={selectedInstallment}
      />
    </FormWrapper>
  );
};
