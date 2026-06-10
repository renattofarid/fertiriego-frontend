import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useProductionOrders } from "../lib/production-order.hook";
import { useProductionOrderStore } from "../lib/production-order.store";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import type { GetProductionOrdersParams } from "../lib/production-order.interface";
import { createProductionOrderColumns } from "./ProductionOrderColumns";
import PageWrapper from "@/components/PageWrapper";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Plus, XCircle, Loader } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import DataTablePagination from "@/components/DataTablePagination";
import { successToast, errorToast } from "@/lib/core.function";
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

export default function ProductionOrderIndexPage() {
  const { ROUTE_ADD, ROUTE, ROUTE_UPDATE, MODEL, ICON } = PRODUCTION_ORDER;
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const params: GetProductionOrdersParams = useMemo(
    () => ({ page, per_page: perPage }),
    [page, perPage],
  );

  const {
    data: orders,
    meta,
    isLoading,
    refetch,
  } = useProductionOrders(params);
  const { submitOrder, approveOrder, rejectOrder, cancelOrder, removeOrder } =
    useProductionOrderStore();

  // Reject dialog state
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");
  const [isRejectLoading, setIsRejectLoading] = useState(false);

  const handleSubmit = async (id: number) => {
    try {
      await submitOrder(id);
      successToast("Orden enviada a revisión correctamente");
      refetch(params);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al enviar la orden");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveOrder(id);
      successToast("Orden aprobada correctamente");
      refetch(params);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al aprobar la orden");
    }
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 4) {
      setRejectionReasonError("El motivo debe tener al menos 4 caracteres");
      return;
    }
    if (!rejectingId) return;
    setIsRejectLoading(true);
    try {
      await rejectOrder(rejectingId, rejectionReason.trim());
      successToast("Orden rechazada correctamente");
      setRejectingId(null);
      setRejectionReason("");
      setRejectionReasonError("");
      refetch(params);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al rechazar la orden");
    } finally {
      setIsRejectLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelOrder(id);
      successToast("Orden anulada correctamente");
      refetch(params);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al anular la orden");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeOrder(id);
      successToast("Orden eliminada correctamente");
      refetch(params);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al eliminar la orden");
    }
  };

  const columns = useMemo(
    () =>
      createProductionOrderColumns({
        onView: (id) => navigate(`${ROUTE}/${id}`),
        onEdit: (id) => navigate(ROUTE_UPDATE.replace(":id", id.toString())),
        onGenerateDocument: (id) =>
          navigate("/documentos-produccion/agregar", {
            state: { fromOrderId: id },
          }),
        onSubmit: handleSubmit,
        onApprove: handleApprove,
        onRejectClick: (id) => setRejectingId(id),
        onCancel: handleCancel,
        onDelete: handleDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, ROUTE, ROUTE_UPDATE, page, perPage],
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <TitleComponent
          title={MODEL.plural ?? "Órdenes de Producción"}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <Button onClick={() => navigate(ROUTE_ADD)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <div className="space-y-4">
        <DataTable columns={columns} data={orders ?? []} />
        {meta && (
          <DataTablePagination
            page={page}
            per_page={meta.per_page ?? perPage}
            totalPages={meta.last_page}
            totalData={meta.total}
            onPageChange={handlePageChange}
            setPerPage={setPerPage}
          />
        )}
      </div>

      {/* Dialog de Rechazo */}
      <Dialog
        open={rejectingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingId(null);
            setRejectionReason("");
            setRejectionReasonError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Orden</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. Esta información quedará registrada
              en la orden.
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
                if (e.target.value.trim().length >= 4)
                  setRejectionReasonError("");
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
              onClick={() => setRejectingId(null)}
              disabled={isRejectLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejectLoading}
            >
              {isRejectLoading ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
