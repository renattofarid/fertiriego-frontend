import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleComponent from "@/components/TitleComponent";
import { usePurchaseStore } from "../lib/purchase.store";
import { usePurchaseDetailStore } from "../lib/purchase-detail.store";
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageOpen, CreditCard, Wallet, Edit } from "lucide-react";
import { PurchaseDetailTable } from "./PurchaseDetailTable";
import { InstallmentPaymentsSheet } from "./sheets/InstallmentPaymentsSheet";
import type { PurchaseInstallmentResource } from "../lib/purchase.interface";

export const PurchaseDetailViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedInstallment, setSelectedInstallment] = useState<PurchaseInstallmentResource | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const { purchase, fetchPurchase, isFinding } = usePurchaseStore();
  const { details, fetchDetails } = usePurchaseDetailStore();
  const { installments, fetchInstallments } = usePurchaseInstallmentStore();

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

  const handleViewInstallmentPayments = (installment: PurchaseInstallmentResource) => {
    setSelectedInstallment(installment);
    setIsPaymentSheetOpen(true);
  };

  if (isFinding) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/compras" />
            <TitleComponent title="Detalle de Compra" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!purchase) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/compras" />
          <TitleComponent title="Detalle de Compra" />
        </div>
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
            <BackButton to="/compras" />
            <TitleComponent title={`Compra ${purchase.correlativo}`} />
          </div>
          <Button onClick={handleEditPurchase} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-muted-foreground">Correlativo</span>
                <p className="font-semibold text-lg">{purchase.correlativo}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Proveedor</span>
                <p className="font-semibold">{purchase.supplier_fullname}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Almacén</span>
                <p className="font-semibold">{purchase.warehouse_name || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Usuario</span>
                <p className="font-semibold">{purchase.user_name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Tipo de Documento</span>
                <p className="font-semibold">{purchase.document_type}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Número de Documento</span>
                <p className="font-semibold font-mono">{purchase.document_number}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fecha de Emisión</span>
                <p className="font-semibold">
                  {new Date(purchase.issue_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Tipo de Pago</span>
                <div className="mt-1">
                  <Badge variant={purchase.payment_type === "CONTADO" ? "default" : "secondary"}>
                    {purchase.payment_type}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Moneda</span>
                <p className="font-semibold">{purchase.currency === "PEN" ? "Soles (S/.)" : "Dólares ($)"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total</span>
                <p className="font-bold text-2xl text-green-600">
                  {purchase.currency === "PEN" ? "S/." : "$"} {parseFloat(purchase.total_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Saldo Pendiente</span>
                <p className="font-bold text-2xl text-orange-600">
                  {purchase.currency === "PEN" ? "S/." : "$"} {parseFloat(purchase.current_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Estado</span>
                <div className="mt-1">
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
              </div>
            </div>

            {purchase.observations && (
              <div className="mt-6">
                <span className="text-sm text-muted-foreground">Observaciones</span>
                <p className="mt-1 text-sm bg-sidebar p-3 rounded-md">{purchase.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs de Detalles, Cuotas y Pagos */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <PackageOpen className="h-4 w-4" />
              Detalles ({details?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="installments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cuotas ({installments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Resumen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <PurchaseDetailTable
                  details={details || []}
                  onEdit={() => {}}
                  onRefresh={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cuotas de la Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {installments && installments.length > 0 ? (
                    installments.map((installment) => (
                      <Card key={installment.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <CardTitle className="text-base">
                                Cuota #{installment.installment_number} - {installment.correlativo}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInstallmentPayments(installment)}
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              Ver Pagos
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Fecha Vencimiento:</span>
                              <p className="font-semibold">
                                {new Date(installment.due_date).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Días:</span>
                              <p className="font-semibold">{installment.due_days} días</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Monto:</span>
                              <p className="font-semibold text-lg">
                                {parseFloat(installment.amount).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Saldo:</span>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-sidebar rounded-lg">
                    <span className="font-semibold">Total de la Compra:</span>
                    <span className="text-2xl font-bold">
                      {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                      {parseFloat(purchase.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="font-semibold">Total Pagado:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                      {(parseFloat(purchase.total_amount) - parseFloat(purchase.current_amount)).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <span className="font-semibold">Saldo Pendiente:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                      {parseFloat(purchase.current_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <PackageOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Productos</p>
                          <p className="text-3xl font-bold">{details?.length || 0}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Cuotas</p>
                          <p className="text-3xl font-bold">{installments?.length || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
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
