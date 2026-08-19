import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  useProductionOrderById,
  useDeleteProductionOrder,
  useSubmitProductionOrder,
  useApproveProductionOrder,
  useRejectProductionOrder,
  useCancelProductionOrder,
} from "../lib/production-order.hook";
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
  Users,
  Pencil,
  Send,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  Loader,
  History,
} from "lucide-react";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import type {
  ProductionOrderComponentResource,
  ProductionOrderDetailItem,
  ProductionOrderStatus,
} from "../lib/production-order.interface";
import TitleFormComponent from "@/components/TitleFormComponent";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { ProductionOrderItemHistoryDialog } from "./ProductionOrderItemHistoryDialog";

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

const itemStatusColor: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  EN_PROCESO: "bg-blue-100 text-blue-700",
  PROCESADO: "bg-green-100 text-green-700",
};

const itemColumns: ColumnDef<ProductionOrderDetailItem>[] = [
  {
    accessorKey: "product",
    header: "Producto",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.product.name}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.product.category_name} · {row.original.product.unit_name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "quantity_requested",
    header: "Solicitada",
    cell: ({ row }) => <span>{row.original.quantity_requested}</span>,
  },
  {
    accessorKey: "quantity_produced",
    header: "Producida",
    cell: ({ row }) => <span>{row.original.quantity_produced}</span>,
  },
  {
    accessorKey: "quantity_pending",
    header: "Pendiente",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.quantity_pending}</span>
    ),
  },
  {
    accessorKey: "progress_percentage",
    header: "Avance",
    cell: ({ row }) => <span>{row.original.progress_percentage}%</span>,
  },
  {
    accessorKey: "estimated_total_cost",
    header: "Costo Estimado",
    cell: ({ row }) => (
      <span className="font-semibold">
        S/ {row.original.estimated_total_cost.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          itemStatusColor[row.original.status] ?? "bg-slate-100 text-slate-700"
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
];

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
  // {
  //   accessorKey: "waste_percentage",
  //   header: "Merma",
  //   cell: ({ row }) => (
  //     <span>
  //       {row.original.waste_quantity ?? 0} ({row.original.waste_percentage ?? 0}%)
  //     </span>
  //   ),
  // },
  {
    accessorKey: "total_cost",
    header: "Costo Total",
    cell: ({ row }) => (
      <span className="font-semibold">S/ {row.original.total_cost.toFixed(2)}</span>
    ),
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
  const numId = Number(id);
  const { data: order, isLoading: isFinding } = useProductionOrderById(numId);
  const removeOrder = useDeleteProductionOrder();
  const submitOrder = useSubmitProductionOrder();
  const approveOrder = useApproveProductionOrder();
  const rejectOrder = useRejectProductionOrder();
  const cancelOrder = useCancelProductionOrder();
  const { access, user } = useAuthStore();

  const canApprovePermission =
    user?.rol_id === 1 ||
    !!access?.find((perm) =>
      perm.permissions.some((p) =>
        p.routes.some((r) => r === "aprobar-orden-produccion"),
      ),
    );
  const canRejectPermission =
    user?.rol_id === 1 ||
    !!access?.find((perm) =>
      perm.permissions.some((p) =>
        p.routes.some((r) => r === "rechazar-orden-produccion"),
      ),
    );

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");

  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyItemId, setHistoryItemId] = useState<number | null>(null);
  const [historyProductName, setHistoryProductName] = useState<string>("");

  const handleViewHistory = (item: ProductionOrderDetailItem) => {
    setHistoryItemId(item.id);
    setHistoryProductName(item.product.name);
    setHistoryDialogOpen(true);
  };

  const handleSubmit = () => submitOrder.mutate(numId);

  const handleApprove = () => approveOrder.mutate(numId);

  const handleCancel = () => cancelOrder.mutate(numId);

  const handleDelete = () => removeOrder.mutate(numId, { onSuccess: () => navigate(ROUTE) });

  const handleReject = () => {
    if (rejectionReason.trim().length < 4) {
      setRejectionReasonError("El motivo debe tener al menos 4 caracteres");
      return;
    }
    rejectOrder.mutate(
      { id: numId, rejection_reason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectionReason("");
          setRejectionReasonError("");
        },
      },
    );
  };

  if (isFinding || !order) {
    return <FormSkeleton />;
  }

  const canEdit = order.status === "BORRADOR" || order.status === "RECHAZADO";
  const canDelete = order.status === "BORRADOR" || order.status === "RECHAZADO";
  const canSubmit = order.status === "BORRADOR" || order.status === "RECHAZADO";
  const canApprove = order.status === "PENDIENTE" && canApprovePermission;
  const canReject = order.status === "PENDIENTE" && canRejectPermission;
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
            <p className="text-xs text-muted-foreground">Cant. Solicitada / Producida</p>
            <p className="text-lg font-bold">
              {order.total_requested} / {order.total_produced}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cantidad Pendiente</p>
            <p className="text-lg font-bold">{order.total_pending}</p>
          </div>
        </GroupFormSection>

        {/* Fechas y Moneda */}
        <GroupFormSection title="Fechas y Moneda" icon={Package} cols={{ sm: 1, md: 2, lg: 3 }}>
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
            <p className="font-semibold">
              {[order.responsible.names, order.responsible.father_surname, order.responsible.mother_surname]
                .filter(Boolean)
                .join(" ") || "-"}
            </p>
            <p className="text-sm text-muted-foreground">{order.responsible.number_document}</p>
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

        {/* Productos a producir (ítems) */}
        <GroupFormSection title="Productos a Producir" icon={Package} cols={{ sm: 1 }}>
          <DataTable columns={itemColumns} data={order.items} />
        </GroupFormSection>

        {/* Componentes por producto */}
        <GroupFormSection title="Componentes por Producto" icon={Package} cols={{ sm: 1 }}>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b">
                  <span className="text-sm font-semibold">{item.product.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Costo componentes: S/ {item.estimated_component_cost.toFixed(2)} · Laboral: S/{" "}
                      {item.labor_cost.toFixed(2)} · Indirecto: S/ {item.overhead_cost.toFixed(2)} · Total: S/{" "}
                      {item.estimated_total_cost.toFixed(2)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => handleViewHistory(item)}
                    >
                      <History className="h-3.5 w-3.5 mr-1.5" />
                      Historial
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <DataTable columns={componentColumns} data={item.components || []} />
                </div>
              </div>
            ))}
          </div>
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
              disabled={rejectOrder.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectOrder.isPending}
            >
              {rejectOrder.isPending ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Historial de Producción del Ítem */}
      <ProductionOrderItemHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        itemId={historyItemId}
        productName={historyProductName}
      />
    </FormWrapper>
  );
}
