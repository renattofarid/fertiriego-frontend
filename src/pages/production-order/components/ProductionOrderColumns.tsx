import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  FilePlus,
  Pencil,
  Send,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
} from "lucide-react";
import type {
  ProductionOrderResource,
  ProductionOrderStatus,
} from "../lib/production-order.interface";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { ButtonAction } from "@/components/ButtonAction";
import { ColumnActions } from "@/components/SelectActions";

const statusConfig: Record<
  ProductionOrderStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  BORRADOR: {
    label: "Borrador",
    dot: "bg-slate-400",
    text: "text-slate-700",
    bg: "bg-slate-100",
  },
  PENDIENTE: {
    label: "Pendiente",
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-100",
  },
  APROBADO: {
    label: "Aprobado",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-100",
  },
  RECHAZADO: {
    label: "Rechazado",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-100",
  },
  PROCESADO: {
    label: "Procesado",
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-100",
  },
  ANULADO: {
    label: "Anulado",
    dot: "bg-zinc-400",
    text: "text-zinc-600",
    bg: "bg-zinc-100",
  },
};

export type ProductionOrderColumnCallbacks = {
  onView: (id: number) => void;
  onEdit?: (id: number) => void;
  onGenerateDocument?: (id: number) => void;
  onSubmit?: (id: number) => void;
  onApprove?: (id: number) => void;
  onRejectClick?: (id: number) => void;
  onCancel?: (id: number) => void;
  onDelete?: (id: number) => void;
  canApprove?: boolean;
  canReject?: boolean;
};

export const createProductionOrderColumns = (
  callbacks: ProductionOrderColumnCallbacks,
): ColumnDef<ProductionOrderResource>[] => [
  {
    accessorKey: "order_number",
    header: "N° Orden",
    cell: ({ row }) => (
      <div>
        <div className="font-mono font-bold">{row.original.order_number}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.requested_date}
        </div>
      </div>
    ),
  },
  {
    id: "items_count",
    header: "Ítems",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.items?.length ?? 0}</span>
    ),
  },
  {
    accessorKey: "total_requested",
    header: "Cant. Solicitada",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.total_requested}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.currency}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "total_produced",
    header: "Cant. Producida",
    cell: ({ row }) => <span>{row.original.total_produced}</span>,
  },
  {
    accessorKey: "total_pending",
    header: "Cant. Pendiente",
    cell: ({ row }) => (
      <span className="font-semibold text-amber-600">
        {row.original.total_pending}
      </span>
    ),
  },
  {
    id: "estimated_total_cost",
    header: "Costo Total",
    cell: ({ row }) => {
      const total = (row.original.items ?? []).reduce(
        (sum, item) => sum + (item.estimated_total_cost ?? 0),
        0,
      );
      return <span className="font-semibold">S/ {total.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const cfg = statusConfig[status] ?? statusConfig.BORRADOR;
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
        >
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status, total_pending } = row.original;
      const canEdit = status === "BORRADOR" || status === "RECHAZADO";
      const canSubmit = status === "BORRADOR" || status === "RECHAZADO";
      const canApprove =
        status === "PENDIENTE" && callbacks.canApprove !== false;
      const canReject =
        status === "PENDIENTE" && callbacks.canReject !== false;
      const canCancel = status !== "PROCESADO" && status !== "ANULADO";
      const canDelete = status === "BORRADOR" || status === "RECHAZADO";
      // ⚠️ El listado ya no trae "production_document_id" a nivel de orden
      // (ese campo era del modelo viejo de 1 solo ítem). Con items[], la
      // señal de "todavía se puede generar documento" es que quede cantidad
      // pendiente de producir en la orden aprobada.
      const canGenerateDocument = status === "APROBADO" && total_pending > 0;

      return (
        <ColumnActions>
          <ButtonAction
            icon={Eye}
            tooltip="Ver detalle"
            onClick={() => callbacks.onView(id)}
          />

          <ButtonAction
            icon={Pencil}
            tooltip="Editar"
            canRender={canEdit && !!callbacks.onEdit}
            onClick={() => callbacks.onEdit!(id)}
          />

          {canSubmit && callbacks.onSubmit && (
            <ConfirmationDialog
              trigger={
                <ButtonAction
                  color="blue"
                  icon={Send}
                  tooltip="Enviar a Revisión"
                />
              }
              title="Enviar a Revisión"
              description="¿Está seguro de enviar esta orden a revisión? Pasará al estado PENDIENTE."
              confirmText="Enviar"
              icon="info"
              onConfirm={() => callbacks.onSubmit!(id)}
            />
          )}

          {canApprove && callbacks.onApprove && (
            <ConfirmationDialog
              trigger={
                <ButtonAction
                  color="green"
                  icon={CheckCircle}
                  tooltip="Aprobar"
                />
              }
              title="Aprobar Orden"
              description="¿Está seguro de aprobar esta orden de producción? Pasará al estado APROBADO."
              confirmText="Aprobar"
              icon="info"
              onConfirm={() => callbacks.onApprove!(id)}
            />
          )}

          <ButtonAction
            icon={XCircle}
            tooltip="Rechazar"
            canRender={canReject && !!callbacks.onRejectClick}
            onClick={() => callbacks.onRejectClick!(id)}
          />

          {callbacks.onGenerateDocument && canGenerateDocument && (
            <ButtonAction
              icon={FilePlus}
              color="indigo"
              tooltip="Generar Documento de Producción"
              onClick={() => callbacks.onGenerateDocument!(id)}
            />
          )}

          {canCancel && callbacks.onCancel && (
            <ConfirmationDialog
              trigger={
                <ButtonAction color="orange" icon={Ban} tooltip="Anular" />
              }
              title="Anular Orden"
              description="¿Está seguro de anular esta orden de producción? Pasará al estado ANULADO."
              confirmText="Anular"
              icon="warning"
              onConfirm={() => callbacks.onCancel!(id)}
            />
          )}

          {canDelete && callbacks.onDelete && (
            <ConfirmationDialog
              trigger={
                <ButtonAction color="red" icon={Trash2} tooltip="Eliminar" />
              }
              title="Eliminar Orden"
              description="¿Está seguro de eliminar esta orden? Esta acción no se puede deshacer."
              confirmText="Eliminar"
              icon="danger"
              onConfirm={() => callbacks.onDelete!(id)}
            />
          )}
        </ColumnActions>
      );
    },
  },
];
