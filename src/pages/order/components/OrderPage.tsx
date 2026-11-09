"use client";

import { useEffect, useState } from "react";
import { useOrder } from "../lib/order.hook";
import OrderTable from "./OrderTable";
import { getOrderColumns } from "./OrderColumns";
import { useOrderStore } from "../lib/order.store";
import { useNavigate } from "react-router-dom";
import { ORDER, type OrderResource } from "../lib/order.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import ExportButtons from "@/components/ExportButtons";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import DataTablePagination from "@/components/DataTablePagination";
import { useSidebar } from "@/components/ui/sidebar";
import { api } from "@/lib/config";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { Option } from "@/lib/core.interface";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { format } from "date-fns";

const mapClientOption = (person: PersonResource): Option => ({
  value: String(person.id),
  label: person.business_name || person.names,
  description: person.number_document,
});

const fmtDate = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : undefined);

interface DateRange {
  from?: Date;
  to?: Date;
}

export default function OrderPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openDelete, setOpenDelete] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const { setOpen, setOpenMobile } = useSidebar();

  // Solo se envía el rango cuando están ambas fechas.
  const dateParams =
    dateRange.from && dateRange.to
      ? { from: fmtDate(dateRange.from), to: fmtDate(dateRange.to) }
      : {};

  const { data, isLoading, refetch } = useOrder({
    page,
    search,
    per_page,
    customer_id: customerId ? Number(customerId) : undefined,
    ...dateParams,
  });

  useEffect(() => {
    setPage(1);
  }, [search, per_page, customerId, dateRange]);

  const { removeOrder } = useOrderStore();

  const handleEdit = (order: OrderResource) => {
    navigate(`/pedidos/actualizar/${order.id}`);
  };

  const handleDelete = (id: number) => {
    setOrderToDelete(id);
    setOpenDelete(true);
  };

  const handleViewDetails = async (order: OrderResource) => {
    navigate(`/pedidos/${order.id}`);
  };

  const handleGenerateSale = (order: OrderResource) => {
    navigate(`/ventas/agregar?order_id=${order.id}`);
  };

  useEffect(() => {
    setOpen(true);
    setOpenMobile(true);
  }, []);

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        await removeOrder(orderToDelete);
        refetch();
        setOpenDelete(false);
        setOrderToDelete(null);
      } catch (error) {
        console.error("Error al eliminar pedido", error);
      }
    }
  };

  // El Excel debe respetar los mismos filtros que la vista (buscador, cliente y fechas).
  const handleExcelDownload = async () => {
    const term = search.trim();
    const response = await api.get("/order/export", {
      params: {
        search: term || undefined,
        customer_id: customerId ? Number(customerId) : undefined,
        ...dateParams,
      },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pedidos.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const { MODEL, ICON } = ORDER;

  const columns = getOrderColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    onGenerateSale: handleGenerateSale,
  });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todos los pedidos registrados en el sistema"
          icon={ICON}
        />
        <div className="flex items-center gap-2">
          <ExportButtons onExcelDownload={handleExcelDownload} />
          <Button onClick={() => navigate("/pedidos/agregar")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      <OrderTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
      >
        <div className="flex flex-wrap items-center gap-2 mb-4 flex-1 min-w-0">
          <Input
            placeholder="Buscar pedidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <div className="w-full sm:w-64">
            <SearchableSelectAsync
              value={customerId}
              onChange={setCustomerId}
              placeholder="Filtrar por cliente"
              useQueryHook={useClients}
              mapOptionFn={mapClientOption}
            />
          </div>
          <DateRangePickerFilter
            dateFrom={dateRange.from}
            dateTo={dateRange.to}
            onDateChange={(from, to) => setDateRange({ from, to })}
            placeholder="Rango de fechas"
            className="w-fit"
          />
        </div>
      </OrderTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      <SimpleDeleteDialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </PageWrapper>
  );
}
