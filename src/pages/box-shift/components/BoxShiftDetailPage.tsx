import { useParams } from "react-router-dom";
import { useBoxShiftById } from "../lib/box-shift.hook";
import { useBoxMovement } from "@/pages/box-movement/lib/box-movement.hook";
import { useBoxMovementStore } from "@/pages/box-movement/lib/box-movement.store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BOX_SHIFT } from "../lib/box-shift.interface";
import { BOX_MOVEMENT } from "@/pages/box-movement/lib/box-movement.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BoxMovementTable from "@/pages/box-movement/components/BoxMovementTable";
import { BoxMovementColumns } from "@/pages/box-movement/components/BoxMovementColumns";
import { useState } from "react";
import BoxMovementCreateModal from "@/pages/box-movement/components/BoxMovementCreateModal";
import FormSkeleton from "@/components/FormSkeleton";
import TitleFormComponent from "@/components/TitleFormComponent";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { GeneralModal } from "@/components/GeneralModal";
import type { BoxMovementResource } from "@/pages/box-movement/lib/box-movement.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import PageWrapper from "@/components/PageWrapper";

export default function BoxShiftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ROUTE, ICON } = BOX_SHIFT;
  const shiftId = parseInt(id || "0");
  const [createMovementModal, setCreateMovementModal] = useState(false);
  const [viewMovementModal, setViewMovementModal] = useState(false);
  const [selectedMovement, setSelectedMovement] =
    useState<BoxMovementResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: shift, isFinding } = useBoxShiftById(shiftId);
  const {
    data: movements,
    isLoading: loadingMovements,
    refetch,
  } = useBoxMovement({
    box_shift_id: shiftId,
  });
  const { MODEL } = BOX_MOVEMENT;

  const { deleteBoxMovement } = useBoxMovementStore();

  const handleDeleteMovement = async (id: number) => {
    try {
      await deleteBoxMovement(id);
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      refetch();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "delete"),
      );
      console.error(error);
    }
  };

  const handleViewMovement = (id: number) => {
    const movement = movements?.find((m) => m.id === id);
    if (movement) {
      setSelectedMovement(movement);
      setViewMovementModal(true);
    }
  };

  if (isFinding) return <FormSkeleton />;

  if (!shift) {
    return (
      <PageWrapper>
        <TitleFormComponent
          title="Turno no encontrado"
          mode="detail"
          icon={ICON}
          backRoute={ROUTE}
        />
        <p className="text-center text-muted-foreground">
          No se encontró el turno con ID {id}.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <TitleFormComponent
            title={`Turno #${shift.id}`}
            mode="detail"
            backRoute={ROUTE}
            icon={ICON}
          />
        </div>
        <Badge
          variant={shift.is_open ? "default" : "secondary"}
          className="text-lg px-4 py-2"
        >
          {shift.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card: Monto Inicial */}
        <Card className="gap-2">
          <CardHeader className="space-y-0">
            <CardTitle className="text-xs uppercase text-muted-foreground font-medium">
              Monto Inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-semibold">
              {formatCurrency(shift.started_amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(shift.open_date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>

        {/* Card: Movimientos */}
        <Card className="gap-2">
          <CardHeader className="space-y-0">
            <CardTitle className="text-xs uppercase text-muted-foreground font-medium">
              Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">
                Ingresos
              </span>
              <span className="text-lg font-semibold text-green-600">
                +{formatCurrency(shift.total_income)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">
                Egresos
              </span>
              <span className="text-lg font-semibold text-red-600">
                -{formatCurrency(shift.total_outcome)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card: Balance */}
        <Card className="gap-2">
          <CardHeader className="space-y-0">
            <CardTitle className="text-xs uppercase text-muted-foreground font-medium">
              Balance Esperado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">
              {formatCurrency(shift.expected_balance)}
            </p>
            {shift.is_closed && (
              <div className="space-y-1.5 pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Cierre</span>
                  <span className="font-medium">
                    {formatCurrency(shift.closed_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Diferencia</span>
                  <span
                    className={`font-semibold ${
                      shift.difference === 0
                        ? "text-green-600"
                        : shift.difference > 0
                          ? "text-blue-600"
                          : "text-red-600"
                    }`}
                  >
                    {shift.difference > 0 && "+"}
                    {formatCurrency(shift.difference)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {shift.observation && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-medium">
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {shift.observation}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Movimientos del Turno</h2>
          {shift.is_open && (
            <Button size="sm" onClick={() => setCreateMovementModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Movimiento
            </Button>
          )}
        </div>

        <BoxMovementTable
          columns={BoxMovementColumns({
            onDelete: setDeleteId,
            onView: handleViewMovement,
          })}
          data={movements || []}
          isLoading={loadingMovements}
        />
      </div>

      {createMovementModal && (
        <BoxMovementCreateModal
          open={createMovementModal}
          onOpenChange={setCreateMovementModal}
          boxId={shift.box_id}
          onSuccess={() => {
            setCreateMovementModal(false);
            refetch();
          }}
        />
      )}

      {deleteId && (
        <SimpleDeleteDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={() => handleDeleteMovement(deleteId)}
        />
      )}

      {viewMovementModal && selectedMovement && (
        <GeneralModal
          open={viewMovementModal}
          onClose={() => {
            setViewMovementModal(false);
            setSelectedMovement(null);
          }}
          title={`Movimiento #${selectedMovement.number_movement}`}
          subtitle="Detalles del movimiento"
          icon={BOX_MOVEMENT.ICON}
          mode="detail"
          size="2xl"
        >
          <div className="space-y-6">
            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Tipo de Movimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      selectedMovement.type === "INGRESO"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      selectedMovement.type === "INGRESO"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }
                  >
                    {selectedMovement.type}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Fecha del Movimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium">
                    {new Date(selectedMovement.movement_date).toLocaleString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Concepto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium">
                    {selectedMovement.concept}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Monto Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${
                      selectedMovement.type === "INGRESO"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedMovement.type === "INGRESO" ? "+" : "-"}
                    {formatCurrency(selectedMovement.total_amount)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Métodos de Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selectedMovement.payment_methods || {}).map(
                    ([method, amount]) => (
                      <div
                        key={method}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <span className="text-sm font-medium">{method}</span>
                        <span className="text-sm font-bold">
                          {formatCurrency(parseFloat(amount))}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comentarios */}
            {selectedMovement.comment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comentarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {selectedMovement.comment}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Información del Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creado el:</span>
                  <span className="font-medium">
                    {new Date(selectedMovement.created_at).toLocaleString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Última actualización:
                  </span>
                  <span className="font-medium">
                    {new Date(selectedMovement.updated_at).toLocaleString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </GeneralModal>
      )}
    </PageWrapper>
  );
}
