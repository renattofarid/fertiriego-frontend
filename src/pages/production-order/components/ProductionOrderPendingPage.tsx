import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useProductionOrdersPending } from "../lib/production-order.hook";
import { PRODUCTION_ORDER, ProductionOrderDetailRoute } from "../lib/production-order.interface";
import type { ProductionOrderPendingItem } from "../lib/production-order.interface";
import PageWrapper from "@/components/PageWrapper";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { ButtonAction } from "@/components/ButtonAction";
import { ArrowLeft, Eye, ListChecks } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";

export default function ProductionOrderPendingPage() {
  const { ROUTE } = PRODUCTION_ORDER;
  const navigate = useNavigate();
  const { data: pending, isLoading } = useProductionOrdersPending();

  const columns = useMemo<ColumnDef<ProductionOrderPendingItem>[]>(
    () => [
      {
        accessorKey: "order_number",
        header: "N° Orden",
        cell: ({ row }) => (
          <div>
            <div className="font-mono font-bold">{row.original.order_number}</div>
            <div className="text-sm text-muted-foreground">{row.original.requested_date}</div>
          </div>
        ),
      },
      {
        accessorKey: "product_name",
        header: "Producto",
        cell: ({ row }) => <span>{row.original.product_name}</span>,
      },
      {
        accessorKey: "quantity_requested",
        header: "Cant. Solicitada",
        cell: ({ row }) => <span>{row.original.quantity_requested}</span>,
      },
      {
        accessorKey: "quantity_produced",
        header: "Cant. Producida",
        cell: ({ row }) => <span>{row.original.quantity_produced}</span>,
      },
      {
        accessorKey: "quantity_pending",
        header: "Cant. Pendiente",
        cell: ({ row }) => (
          <span className="font-semibold text-amber-600">{row.original.quantity_pending}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <span>{row.original.status}</span>,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <ButtonAction
            icon={Eye}
            tooltip="Ver orden"
            onClick={() => navigate(ProductionOrderDetailRoute.replace(":id", row.original.order_id.toString()))}
          />
        ),
      },
    ],
    [navigate],
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <TitleComponent
          title="Pendientes a Producir"
          subtitle="Órdenes/ítems aprobados con producción pendiente de completar"
          icon="ListChecks"
        />
        <Button variant="outline" onClick={() => navigate(ROUTE)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Órdenes
        </Button>
      </div>

      {(!pending || pending.length === 0) && (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          <ListChecks className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No hay órdenes pendientes de producir en este momento.
        </div>
      )}

      {pending && pending.length > 0 && (
        <DataTable columns={columns} data={pending} />
      )}
    </PageWrapper>
  );
}
