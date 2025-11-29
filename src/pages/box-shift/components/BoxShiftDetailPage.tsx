import { useParams, useNavigate } from "react-router-dom";
import { useBoxShiftById } from "../lib/box-shift.hook";
import { useBoxMovement } from "@/pages/box-movement/lib/box-movement.hook";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BOX_SHIFT } from "../lib/box-shift.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BoxMovementTable from "@/pages/box-movement/components/BoxMovementTable";
import { BoxMovementColumns } from "@/pages/box-movement/components/BoxMovementColumns";
import { useState } from "react";
import BoxMovementCreateModal from "@/pages/box-movement/components/BoxMovementCreateModal";

export default function BoxShiftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shiftId = parseInt(id || "0");
  const [createMovementModal, setCreateMovementModal] = useState(false);

  const { data: shift, isFinding } = useBoxShiftById(shiftId);
  const { data: movements, isLoading: loadingMovements, refetch } = useBoxMovement({
    box_shift_id: shiftId,
  });

  if (isFinding) {
    return <div className="text-center py-8">Cargando turno...</div>;
  }

  if (!shift) {
    return <div className="text-center py-8">No se encontró el turno</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(BOX_SHIFT.ROUTE)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <TitleComponent
            title={`Turno #${shift.id}`}
            subtitle="Detalle del turno de caja"
            icon={BOX_SHIFT.ICON}
          />
        </div>
        <Badge variant={shift.is_open ? "default" : "secondary"} className="text-lg px-4 py-2">
          {shift.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monto Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(shift.started_amount)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Apertura: {new Date(shift.open_date).toLocaleString("es-ES")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Ingresos:</span>
                <span className="text-green-600 font-semibold">
                  +{formatCurrency(shift.total_income)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Egresos:</span>
                <span className="text-red-600 font-semibold">
                  -{formatCurrency(shift.total_outcome)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(shift.expected_balance)}
            </p>
            {shift.is_closed && (
              <>
                <p className="text-sm mt-2">
                  Cierre: {formatCurrency(shift.closed_amount)}
                </p>
                <p className={`text-sm ${shift.difference !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Diferencia: {formatCurrency(shift.difference)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {shift.observation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{shift.observation}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Movimientos del Turno</h2>
          {shift.is_open && (
            <Button onClick={() => setCreateMovementModal(true)}>
              Registrar Movimiento
            </Button>
          )}
        </div>

        <BoxMovementTable
          columns={BoxMovementColumns({
            onDelete: () => {},
            onView: () => {},
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
    </div>
  );
}
