import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startOfMonth, format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, ClipboardList, Eye, ListChecks, PackageCheck, PackageSearch } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { ButtonAction } from "@/components/ButtonAction";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SummaryCard } from "@/components/SummaryCard";
import { useOrderPendingReport } from "../lib/order.hook";
import { OrderRoute, OrderDetailRoute } from "../lib/order.interface";
import type { OrderPendingReportEntry } from "../lib/order.interface";

// Fila aplanada (un producto pendiente por fila) para la tabla del reporte.
interface PendingReportRow {
  order_id: number;
  order_number: string;
  order_date: string;
  order_status: string;
  customer_name: string;
  warehouse_name: string;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity_total: string;
  quantity_shipped: string;
  quantity_pending: number;
}

function flattenReport(entries: OrderPendingReportEntry[]): PendingReportRow[] {
  return entries.flatMap((entry) =>
    entry.pending_details.map((detail) => ({
      order_id: entry.order.id,
      order_number: entry.order.order_number,
      order_date: entry.order.order_date,
      order_status: entry.order.status,
      customer_name: entry.order.customer.name,
      warehouse_name: entry.order.warehouse.name,
      product_id: detail.product_id,
      product_name: detail.product_name,
      product_code: detail.product_code,
      quantity_total: detail.quantity_total,
      quantity_shipped: detail.quantity_shipped,
      quantity_pending: detail.quantity_pending,
    })),
  );
}

export default function OrderPendingReportPage() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const { data, isLoading } = useOrderPendingReport({
    startDate: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
    endDate: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
  });

  const rows = useMemo(() => (data ? flattenReport(data) : []), [data]);
  const orderCount = useMemo(() => new Set(rows.map((r) => r.order_id)).size, [rows]);
  const totalPending = useMemo(
    () => rows.reduce((acc, r) => acc + r.quantity_pending, 0),
    [rows],
  );

  const columns = useMemo<ColumnDef<PendingReportRow>[]>(
    () => [
      {
        accessorKey: "order_number",
        header: "N° Pedido",
        cell: ({ row }) => (
          <div>
            <div className="font-mono font-bold">{row.original.order_number}</div>
            <div className="text-sm text-muted-foreground">{row.original.order_date}</div>
          </div>
        ),
      },
      {
        accessorKey: "customer_name",
        header: "Cliente",
        cell: ({ row }) => <span>{row.original.customer_name}</span>,
      },
      {
        accessorKey: "warehouse_name",
        header: "Almacén",
        cell: ({ row }) => <span>{row.original.warehouse_name}</span>,
      },
      {
        accessorKey: "product_name",
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <div>{row.original.product_name}</div>
            {row.original.product_code && (
              <div className="text-xs text-muted-foreground">{row.original.product_code}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "quantity_total",
        header: "Cant. Total",
        cell: ({ row }) => <span>{row.original.quantity_total}</span>,
      },
      {
        accessorKey: "quantity_shipped",
        header: "Cant. Entregada",
        cell: ({ row }) => <span>{row.original.quantity_shipped}</span>,
      },
      {
        accessorKey: "quantity_pending",
        header: "Cant. Pendiente",
        cell: ({ row }) => (
          <span className="font-semibold text-amber-600">{row.original.quantity_pending}</span>
        ),
      },
      {
        accessorKey: "order_status",
        header: "Estado",
        cell: ({ row }) => <Badge variant="secondary">{row.original.order_status}</Badge>,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <ButtonAction
            icon={Eye}
            tooltip="Ver pedido"
            onClick={() => navigate(OrderDetailRoute.replace(":id", row.original.order_id.toString()))}
          />
        ),
      },
    ],
    [navigate],
  );

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <TitleComponent
          title="Entregas Pendientes"
          subtitle="Pedidos con productos pendientes de entrega en el rango seleccionado"
          icon="ListChecks"
        />
        <div className="flex items-center gap-2">
          <DateRangePickerFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            className="w-64"
          />
          <Button variant="outline" onClick={() => navigate(OrderRoute)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pedidos
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <SummaryCard
          icon={<ClipboardList className="size-4" />}
          label="Pedidos con Pendientes"
          value={String(orderCount)}
          color="blue"
        />
        <SummaryCard
          icon={<PackageSearch className="size-4" />}
          label="Productos Pendientes"
          value={String(rows.length)}
          color="amber"
        />
        <SummaryCard
          icon={<PackageCheck className="size-4" />}
          label="Cantidad Total Pendiente"
          value={String(totalPending)}
          color="orange"
        />
      </div>

      {!isLoading && rows.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          <ListChecks className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No hay pedidos con entregas pendientes en el rango seleccionado.
        </div>
      )}

      {(isLoading || rows.length > 0) && (
        <DataTable columns={columns} data={rows} isLoading={isLoading} />
      )}
    </PageWrapper>
  );
}
