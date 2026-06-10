import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProductionOrderStore } from "../lib/production-order.store";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { GroupFormSection } from "@/components/GroupFormSection";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Package,
  ClipboardList,
  AlertCircle,
  DollarSign,
  Users,
  Pencil,
  Send,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  Loader,
} from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import type {
  ProductionOrderComponentResource,
  ProductionOrderStatus,
} from "../lib/production-order.interface";
import TitleFormComponent from "@/components/TitleFormComponent";

const statusConfig: Record<
  ProductionOrderStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  BORRADOR:  { label: "Borrador",  dot: "bg-slate-400",  text: "text-slate-700",  bg: "bg-slate-100"  },
  PENDIENTE: { label: "Pendiente", dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-100"  },
  APROBADO:  { label: "Aprobado",  dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-100"  },
  RECHAZADO: { label: "Rechazado", dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-100"    },
  PROCESADO: { label: "Procesado", dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-100"   },
  ANULADO:   { label: "Anulado",   dot: "bg-zinc-400",   text: "text-zinc-600",   bg: "bg-zinc-100"   },
};

const componentColumns: ColumnDef<ProductionOrderComponentResource>[] = [
  {
    accessorKey: "component",
    header: "Componente",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.component.name}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.component.category_name} · {row.original.component.unit_name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "quantity_required",
    header: "Cant. Requerida",
    cell: ({ row }) => <span>{row.original.quantity_required}</span>,
  },
  {
    accessorKey: "unit_cost",
    header: "Costo Unitario",
    cell: ({ row }) => <span>S/ {row.original.unit_cost.toFixed(2)}</span>,
  },
  {
    accessorKey: "total_cost",
    header: "Costo Total",
    cell: ({ row }) => (
      <span className="font-semibold">S/ {row.original.total_cost.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "waste_quantity",
    header: "Merma Cant.",
    cell: ({ row }) => <span>{row.original.waste_quantity}</span>,
  },
  {
    accessorKey: "waste_percentage",
    header: "Merma %",
    cell: ({ row }) => <span>{row.original.waste_percentage}%</span>,
  },
  {
    accessorKey: "notes",
    header: "Notas",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.notes || "-"}</span>
    ),
  },
];

export default function ProductionOrderDetailPage() {
  const { ROUTE, ROUTE_UPDATE, ICON } = PRODUCTION_ORDER;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    order,
    fetchOrder,
    removeOrder,
    submitOrder,
    approveOrder,
    rejectOrder,
    cancelOrder,
    isFinding,
  } = useProductionOrderStore();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchOrder(parseInt(id));
  }, [id, fetchOrder]);

  const numId = () => parseInt(id!);

  const handleSubmit = async () => {
    try {
      await submitOrder(numId());
      successToast("Orden enviada a revisión correctamente");
      fetchOrder(numId());
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al enviar la orden");
    }
  };

  const handleApprove = async () => {
    try {
      await approveOrder(numId());
      successToast("Orden aprobada correctamente");
      fetchOrder(numId());
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al aprobar la orden");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(numId());
      successToast("Orden anulada correctamente");
      fetchOrder(numId());
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al anular la orden");
    }
  };

  const handleDelete = async () => {
    try {
      await removeOrder(numId());
      successToast("Orden eliminada correctamente");
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al eliminar la orden");
    }
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 4) {
      setRejectionReasonError("El motivo debe tener al menos 4 caracteres");
      return;
    }
    setIsActionLoading(true);
    try {
      await rejectOrder(numId(), rejectionReason.trim());
      successToast("Orden rechazada correctamente");
      setRejectDialogOpen(false);
      setRejectionReason("");
      setRejectionReasonError("");
      fetchOrder(numId());
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al rechazar la orden");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isFinding || !order) {
    return <FormSkeleton />;
  }

  const canEdit = order.status === "BORRADOR" || order.status === "RECHAZADO";
  const canDelete = order.status === "BORRADOR" || order.status === "RECHAZADO";
  const canSubmit = order.status === "BORRADOR" || order.status === "RECHAZADO";
  const canApprove = order.status === "PENDIENTE";
  const canReject = order.status === "PENDIENTE";
  const canCancel = order.status !== "PROCESADO" && order.status !== "ANULADO";

  const editRoute = ROUTE_UPDATE.replace(":id", id!);
  const statusCfg = statusConfig[order.status];

  return (
    <FormWrapper>
      <div className="mb-6 flex items-center justify-between">
        <TitleFormComponent
          title={`${order.order_number}`}
          mode="detail"
          icon={ICON}
          backRoute={ROUTE}
        />
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={() => navigate(editRoute)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {canSubmit && (
            <ConfirmationDialog
              trigger={
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar a Revisión
                </Button>
              }
              title="Enviar a Revisión"
              description="¿Está seguro de enviar esta orden a revisión? Pasará al estado PENDIENTE."
              confirmText="Enviar"
              icon="info"
              onConfirm={handleSubmit}
            />
          )}
          {canApprove && (
            <ConfirmationDialog
              trigger={
                <Button variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
              }
              title="Aprobar Orden"
              description="¿Está seguro de aprobar esta orden de producción? Pasará al estado APROBADO."
              confirmText="Aprobar"
              icon="info"
              onConfirm={handleApprove}
            />
          )}
          {canReject && (
            <Button variant="destructive" onClick={() => setRejectDialogOpen(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          )}
          {canCancel && (
            <ConfirmationDialog
              trigger={
                <Button variant="outline">
                  <Ban className="h-4 w-4 mr-2" />
                  Anular
                </Button>
              }
              title="Anular Orden"
              description="¿Está seguro de anular esta orden de producción? Pasará al estado ANULADO."
              confirmText="Anular"
              icon="warning"
              onConfirm={handleCancel}
            />
          )}
          {canDelete && (
            <ConfirmationDialog
              trigger={
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              }
              title="Eliminar Orden"
              description="¿Está seguro de eliminar esta orden de producción? Esta acción no se puede deshacer."
              confirmText="Eliminar"
              icon="danger"
              onConfirm={handleDelete}
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Resumen */}
        <GroupFormSection title="Resumen" icon={ClipboardList} cols={{ sm: 2, md: 4 }}>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">N° Orden</p>
            <p className="font-mono font-bold text-lg">{order.order_number}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cantidad Solicitada</p>
            <p className="text-lg font-bold">{order.quantity_requested}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo Total Estimado</p>
            <p className="text-lg font-bold">S/ {order.estimated_total_cost.toFixed(2)}</p>
          </div>
        </GroupFormSection>

        {/* Producto y Fechas */}
        <GroupFormSection title="Producto y Fechas" icon={Package} cols={{ sm: 1, md: 2, lg: 3 }}>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Producto</p>
            <p className="font-semibold">{order.product.name}</p>
            <p className="text-sm text-muted-foreground">
              {order.product.category_name} · {order.product.unit_name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fecha Solicitada</p>
            <p className="font-medium">{order.requested_date}</p>
          </div>
          {order.approved_at && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fecha Aprobación</p>
              <p className="font-medium">{order.approved_at}</p>
            </div>
          )}
          {order.processed_at && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fecha Procesado</p>
              <p className="font-medium">{order.processed_at}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Moneda</p>
            <p className="font-medium">{order.currency}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Creado</p>
            <p className="font-medium">{order.created_at}</p>
          </div>
        </GroupFormSection>

        {/* Almacenes */}
        <GroupFormSection title="Almacenes" icon={Package} cols={{ sm: 1, md: 2 }}>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Almacén Origen</p>
            <p className="font-semibold">{order.warehouse_origin.name}</p>
            <p className="text-sm text-muted-foreground">{order.warehouse_origin.address}</p>
            <p className="text-sm text-muted-foreground">{order.warehouse_origin.branch_name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Almacén Destino</p>
            <p className="font-semibold">{order.warehouse_dest.name}</p>
            <p className="text-sm text-muted-foreground">{order.warehouse_dest.address}</p>
            <p className="text-sm text-muted-foreground">{order.warehouse_dest.branch_name}</p>
          </div>
        </GroupFormSection>

        {/* Participantes */}
        <GroupFormSection title="Participantes" icon={Users} cols={{ sm: 1, md: 3 }}>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Solicitado por</p>
            <p className="font-semibold">{order.user.name || "-"}</p>
            <p className="text-sm text-muted-foreground">{order.user.person?.full_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Responsable</p>
            <p className="font-semibold">{order.responsible.name || "-"}</p>
            {order.responsible.person && (
              <p className="text-sm text-muted-foreground">
                {order.responsible.person.full_name}
              </p>
            )}
          </div>
          {order.approved_by && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Aprobado por</p>
              <p className="font-semibold">{order.approved_by.name || "-"}</p>
              {order.approved_by.person && (
                <p className="text-sm text-muted-foreground">
                  {order.approved_by.person.full_name}
                </p>
              )}
            </div>
          )}
        </GroupFormSection>

        {/* Costos */}
        <GroupFormSection title="Detalles de Costos" icon={DollarSign} cols={{ sm: 2, md: 4 }}>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo de Componentes</p>
            <p className="text-lg font-bold">S/ {order.estimated_component_cost.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo Laboral</p>
            <p className="text-lg font-bold">S/ {order.labor_cost.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo Indirecto</p>
            <p className="text-lg font-bold">S/ {order.overhead_cost.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo Total Estimado</p>
            <p className="text-lg font-bold text-primary">
              S/ {order.estimated_total_cost.toFixed(2)}
            </p>
          </div>
        </GroupFormSection>

        {/* Razón de rechazo */}
        {order.rejection_reason && (
          <GroupFormSection title="Razón de Rechazo" icon={AlertCircle} cols={{ sm: 1 }}>
            <p className="text-sm text-destructive">{order.rejection_reason}</p>
          </GroupFormSection>
        )}

        {/* Observaciones */}
        {order.observations && (
          <GroupFormSection title="Observaciones" icon={AlertCircle} cols={{ sm: 1 }}>
            <p className="text-sm">{order.observations}</p>
          </GroupFormSection>
        )}

        {/* Componentes */}
        <GroupFormSection title="Componentes" icon={Package} cols={{ sm: 1 }}>
          <DataTable columns={componentColumns} data={order.components || []} />
        </GroupFormSection>
      </div>

      {/* Dialog de Rechazo con motivo */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          setRejectDialogOpen(open);
          if (!open) {
            setRejectionReason("");
            setRejectionReasonError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Orden</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. Esta información quedará registrada en la orden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>
              Motivo de rechazo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value.trim().length >= 4) setRejectionReasonError("");
              }}
              placeholder="Describe el motivo del rechazo..."
              rows={4}
              maxLength={1000}
            />
            {rejectionReasonError && (
              <p className="text-sm text-destructive">{rejectionReasonError}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {rejectionReason.length} / 1000
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormWrapper>
  );
}
