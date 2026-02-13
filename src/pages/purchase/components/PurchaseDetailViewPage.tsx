import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseStore } from "../lib/purchase.store";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PackageOpen,
  CreditCard,
  Wallet,
  Pencil,
  RefreshCw,
  FileText,
} from "lucide-react";
import { PurchaseDetailTable } from "./PurchaseDetailTable";
import { InstallmentPaymentsSheet } from "./sheets/InstallmentPaymentsSheet";
import {
  PURCHASE,
  type PurchaseInstallmentResource,
} from "../lib/purchase.interface";
import { errorToast, successToast } from "@/lib/core.function";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GroupFormSection } from "@/components/GroupFormSection";

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
            <p className="font-semibold font-mono">{purchase.document_number}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fecha de Emisión</p>
            <p className="font-semibold">
              {new Date(purchase.issue_date).toLocaleDateString("es-ES", {
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
              <div className="space-y-4">
                {/* Advertencia de desincronización */}
                {purchase &&
                  purchase.payment_type === "CONTADO" &&
                  installments &&
                  installments.length > 0 &&
                  (() => {
                    const totalAmount = parseFloat(purchase.total_amount);
                    const installmentAmount = parseFloat(
                      installments[0]?.amount || "0",
                    );
                    const hasNoPayments =
                      parseFloat(installments[0]?.pending_amount || "0") ===
                      installmentAmount;
                    const hasDifference =
                      Math.abs(installmentAmount - totalAmount) > 0.01;

                    if (hasNoPayments && hasDifference) {
                      return (
                        <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                            ⚠️ La cuota ({installmentAmount.toFixed(2)}) no
                            coincide con el total de la compra (
                            {totalAmount.toFixed(2)}). Debe sincronizar la cuota
                            usando el botón "Sincronizar"
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                {installments && installments.length > 0 ? (
                  installments.map((installment) => (
                    <Card
                      key={installment.id}
                      className="border-l-4 border-l-primary"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <CardTitle className="text-base">
                              Cuota #{installment.installment_number} -{" "}
                              {installment.correlativo}
                            </CardTitle>
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
                          <div className="flex gap-2">
                            {shouldShowSyncButton(installment) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleSyncInstallment(
                                          installment.id,
                                          parseFloat(
                                            purchase?.total_amount || "0",
                                          ),
                                        )
                                      }
                                      color="blue"
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Sincronizar
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Sincronizar con total de compra (
                                      {purchase?.total_amount})
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewInstallmentPayments(installment)
                              }
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              Ver Pagos
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Fecha Vencimiento
                            </p>
                            <p className="font-semibold">
                              {new Date(installment.due_date).toLocaleDateString(
                                "es-ES",
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Días</p>
                            <p className="font-semibold">
                              {installment.due_days} días
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Monto</p>
                            <p className="font-semibold text-lg">
                              {parseFloat(installment.amount).toFixed(2)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Saldo</p>
                            <p className="font-semibold text-lg text-orange-600">
                              {parseFloat(installment.pending_amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Badge variant="outline" className="text-lg p-3">
                      No hay cuotas registradas
                    </Badge>
                  </div>
                )}
              </div>
            </GroupFormSection>
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <GroupFormSection
              title="Resumen Financiero"
              icon={Wallet}
              cols={{ sm: 1, md: 2, lg: 3 }}
            >
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total de la Compra</p>
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
                <p className="font-bold text-3xl">{installments?.length || 0}</p>
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
