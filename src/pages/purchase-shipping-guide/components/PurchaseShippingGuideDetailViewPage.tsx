import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleComponent from "@/components/TitleComponent";
import { usePurchaseShippingGuideStore } from "../lib/purchase-shipping-guide.store";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Link as LinkIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignPurchaseModal } from "./AssignPurchaseModal";
import { errorToast } from "@/lib/core.function";

export const PurchaseShippingGuideDetailViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { guide, fetchGuide, isFinding, assignPurchaseToGuide, isSubmitting } =
    usePurchaseShippingGuideStore();
  const { data: purchases } = useAllPurchases();

  useEffect(() => {
    if (!id) {
      navigate("/guias-compra");
      return;
    }
    fetchGuide(Number(id));
  }, [id, navigate]);

  const handleEditGuide = () => {
    if (guide) {
      navigate(`/guias-compra/actualizar/${guide.id}`);
    }
  };

  const handleAssignPurchase = async (purchaseId: number) => {
    if (!guide) return;
    try {
      await assignPurchaseToGuide(guide.id, purchaseId);
      setIsAssignModalOpen(false);
      fetchGuide(guide.id);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al asignar la compra");
    }
  };

  if (isFinding) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/guias-compra" />
            <TitleComponent title="Detalle de Guía de Compra" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!guide) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/guias-compra" />
          <TitleComponent title="Detalle de Guía de Compra" />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Guía no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/guias-compra" />
            <TitleComponent title={`Guía ${guide.guide_number}`} />
          </div>
          <div className="flex gap-2">
            {!guide.purchase_id && (
              <Button onClick={() => setIsAssignModalOpen(true)} variant="outline">
                <LinkIcon className="h-4 w-4 mr-2" />
                Asignar Compra
              </Button>
            )}
            <Button onClick={handleEditGuide} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
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
                <span className="text-sm text-muted-foreground">Número de Guía</span>
                <p className="font-semibold text-lg font-mono">{guide.guide_number}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Compra Asociada</span>
                <p className="font-semibold">
                  {guide.purchase_correlative ? (
                    <Badge variant="outline">{guide.purchase_correlative}</Badge>
                  ) : (
                    <Badge variant="secondary">Sin compra</Badge>
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Estado</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      guide.status === "EMITIDA"
                        ? "secondary"
                        : guide.status === "ENTREGADA"
                        ? "default"
                        : guide.status === "CANCELADA"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {guide.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fecha de Emisión</span>
                <p className="font-semibold">
                  {new Date(guide.issue_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fecha de Traslado</span>
                <p className="font-semibold">
                  {new Date(guide.transfer_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Peso Total</span>
                <p className="font-semibold">{parseFloat(guide.total_weight).toFixed(2)} kg</p>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-sm text-muted-foreground">Motivo de Traslado</span>
              <p className="mt-1 text-sm bg-sidebar p-3 rounded-md">{guide.motive}</p>
            </div>

            {guide.observations && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">Observaciones</span>
                <p className="mt-1 text-sm bg-sidebar p-3 rounded-md">{guide.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Transportista */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Transportista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-muted-foreground">Transportista</span>
                <p className="font-semibold">{guide.carrier_name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">RUC</span>
                <p className="font-semibold font-mono">{guide.carrier_ruc}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Placa del Vehículo</span>
                <p className="font-semibold font-mono">{guide.vehicle_plate}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Conductor</span>
                <p className="font-semibold">{guide.driver_name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Licencia</span>
                <p className="font-semibold font-mono">{guide.driver_license}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direcciones */}
        <Card>
          <CardHeader>
            <CardTitle>Direcciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-muted-foreground">Dirección de Origen</span>
                <p className="mt-1 text-sm bg-sidebar p-3 rounded-md">{guide.origin_address}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Dirección de Destino</span>
                <p className="mt-1 text-sm bg-sidebar p-3 rounded-md">
                  {guide.destination_address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos ({guide.details?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {guide.details && guide.details.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead>Unidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guide.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-medium">{detail.product_name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {parseFloat(detail.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>{detail.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Badge variant="outline" className="text-lg p-3">
                  No hay productos registrados
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {purchases && (
        <AssignPurchaseModal
          open={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSubmit={handleAssignPurchase}
          purchases={purchases}
          isSubmitting={isSubmitting}
        />
      )}
    </FormWrapper>
  );
};
