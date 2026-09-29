import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startOfMonth, format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardList, Eye, ListChecks, PackageCheck, PackageSearch } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { ButtonAction } from "@/components/ButtonAction";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SummaryCard } from "@/components/SummaryCard";
import { useOrderPendingReport } from "../lib/order.hook";
import { OrderRoute, OrderDetailRoute } from "../lib/order.interface";
import type { OrderPendingReportEntry } from "../lib/order.interface";

export default function OrderPendingReportPage() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(10);

  const { data, meta, isLoading } = useOrderPendingReport({
    startDate: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
    endDate: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
    page,
    per_page,
  });

  // Una fila por pedido; sus productos pendientes se muestran agrupados dentro.
  const orders = useMemo(() => data ?? [], [data]);
  const pageProducts = useMemo(
    () => orders.reduce((acc, o) => acc + o.pending_details.length, 0),
    [orders],
  );
  const pagePending = useMemo(
    () => orders.reduce((acc, o) => acc + o.shipping_progress.pending_quantity, 0),
    [orders],
  );

  const columns = useMemo<ColumnDef<OrderPendingReportEntry>[]>(
    () => [
      {
        id: "order",
        header: "Pedido",
        cell: ({ row }) => {
          const { order } = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold">{order.order_number}</span>
              <span className="text-xs text-muted-foreground">{order.order_date}</span>
              <Badge variant="secondary" className="w-fit">
                {order.status}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "customer",
        header: "Cliente",
        cell: ({ row }) => {
          const { customer, warehouse } = row.original.order;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{customer.name}</span>
              <span className="text-xs text-muted-foreground">{customer.document_number}</span>
              <span className="text-xs text-muted-foreground">Almacén: {warehouse.name}</span>
            </div>
          );
        },
      },
      {
        id: "pending_details",
        header: "Productos pendientes",
        cell: ({ row }) => (
          <div className="min-w-[320px] overflow-hidden rounded-md border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1 text-left font-medium">Producto</th>
                  <th className="px-2 py-1 text-right font-medium">Total</th>
                  <th className="px-2 py-1 text-right font-medium">Entregado</th>
                  <th className="px-2 py-1 text-right font-medium">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {row.original.pending_details.map((detail) => (
                  <tr key={detail.id} className="border-t">
                    <td className="px-2 py-1">
                      <div>{detail.product_name}</div>
                      {detail.product_code && (
                        <div className="text-muted-foreground">{detail.product_code}</div>
                      )}
                    </td>
                    <td className="px-2 py-1 text-right">{detail.quantity_total}</td>
                    <td className="px-2 py-1 text-right">{detail.quantity_shipped}</td>
                    <td className="px-2 py-1 text-right font-semibold text-amber-600">
                      {detail.quantity_pending}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
      {
        id: "progress",
        header: "Avance",
        cell: ({ row }) => {
          const progress = row.original.shipping_progress;
          return (
            <div className="flex min-w-[140px] flex-col gap-1">
              <Progress value={progress.progress_percentage} />
              <span className="text-xs text-muted-foreground">
                {progress.shipped_quantity} / {progress.total_quantity} entregado (
                {progress.progress_percentage}%)
              </span>
              <span className="text-xs font-semibold text-amber-600">
                {progress.pending_quantity} pendiente
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <ButtonAction
            icon={Eye}
            tooltip="Ver pedido"
            onClick={() =>
              navigate(OrderDetailRoute.replace(":id", row.original.order.id.toString()))
            }
          />
        ),
      },
    ],
    [navigate],
  );

  return (
    <PageWrapper>
      <TitleFormComponent title="Entregas Pendientes" icon="ListChecks" className="mb-6">
        <Button variant="outline" className="ml-auto" onClick={() => navigate(OrderRoute)}>
          Ir a Pedidos
        </Button>
      </TitleFormComponent>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <SummaryCard
          icon={<ClipboardList className="size-4" />}
          label="Pedidos con Pendientes"
          value={String(meta?.total ?? 0)}
          color="blue"
        />
        <SummaryCard
          icon={<PackageSearch className="size-4" />}
          label="Productos Pendientes (página)"
          value={String(pageProducts)}
          color="amber"
        />
        <SummaryCard
          icon={<PackageCheck className="size-4" />}
          label="Cantidad Pendiente (página)"
          value={String(pagePending)}
          color="orange"
        />
      </div>

      <DataTable columns={columns} data={orders} isLoading={isLoading}>
        <DateRangePickerFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
            setPage(1);
          }}
          className="w-64"
        />
      </DataTable>

      {!isLoading && orders.length === 0 && (
        <div className="mt-2 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          <ListChecks className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No hay pedidos con entregas pendientes en el rango seleccionado.
        </div>
      )}

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={(value) => {
          setPerPage(value);
          setPage(1);
        }}
        totalData={meta?.total || 0}
      />
    </PageWrapper>
  );
}
