import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGuides } from "../lib/guide.hook";
import TitleComponent from "@/components/TitleComponent";
import GuideActions from "./GuideActions";
import GuideTable from "./GuideTable";
import GuideOptions, {
  EMPTY_GUIDE_FILTERS,
  type GuideFilters,
} from "./GuideOptions";
import type { GetGuidesParams } from "../lib/guide.actions";
import { format } from "date-fns";
import { useGuideStore } from "../lib/guide.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { GuideStatusChangeDialog } from "./GuideStatusChangeDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { GuideColumns } from "./GuideColumns";
import { GuideLinkOrderDialog } from "./GuideLinkOrderDialog";
import DataTablePagination from "@/components/DataTablePagination";
import {
  GUIDE,
  GUIDE_ENDPOINT,
  type GuideStatus,
  type GuideResource,
} from "../lib/guide.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useSidebar } from "@/components/ui/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { WAREHOUSE_PRODUCT } from "@/pages/warehouse-product/lib/warehouse-product.interface";
import { PRODUCT } from "@/pages/product/lib/product.interface";
const { MODEL, ICON } = GUIDE;

export default function GuidePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GuideFilters>(EMPTY_GUIDE_FILTERS);
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusChangeData, setStatusChangeData] = useState<{
    id: number;
    currentStatus: GuideStatus;
  } | null>(null);
  const [linkOrderGuide, setLinkOrderGuide] = useState<GuideResource | null>(
    null,
  );
  const { setOpen, setOpenMobile } = useSidebar();
  // Filtros compartidos entre el listado y la exportación
  const filterParams = useMemo(() => {
    const params: GetGuidesParams = {};
    const fmt = (d: Date) => format(d, "yyyy-MM-dd");
    if (filters.full_guide_number)
      params.full_guide_number = filters.full_guide_number;
    if (filters.status) params.status = filters.status;
    (
      [
        "warehouse_id",
        "recipient_id",
        "carrier_id",
        "driver_id",
        "vehicle_id",
        "motive_id",
      ] as const
    ).forEach((key) => {
      if (filters[key]) params[key] = Number(filters[key]);
    });
    if (filters.issue_date_from && filters.issue_date_to) {
      params["issue_date[0]"] = fmt(filters.issue_date_from);
      params["issue_date[1]"] = fmt(filters.issue_date_to);
    }
    if (filters.transfer_date_from && filters.transfer_date_to) {
      params["transfer_date[0]"] = fmt(filters.transfer_date_from);
      params["transfer_date[1]"] = fmt(filters.transfer_date_to);
    }
    return params;
  }, [filters]);

  // SearchInput llama onChange en cada render aunque el valor no cambie;
  // si no hay cambios reales no tocamos el estado para evitar un bucle de renders.
  const handleFiltersChange = (changes: Partial<GuideFilters>) => {
    setFilters((prev) => {
      const hasChanges = (Object.keys(changes) as (keyof GuideFilters)[]).some(
        (key) => changes[key] !== prev[key],
      );
      if (!hasChanges) return prev;
      setPage(1);
      return { ...prev, ...changes };
    });
  };

  const { data, isLoading, refetch } = useGuides({
    page,
    per_page,
    ...filterParams,
  });
  // Selectores puntuales: suscribirse a todo el store re-renderiza la página
  // (y remonta las celdas) con cualquier cambio, p. ej. al cargar motivos.
  const removeGuide = useGuideStore((s) => s.removeGuide);
  const changeStatus = useGuideStore((s) => s.changeStatus);
  const queryClient = useQueryClient();

  // Anular una guía (o eliminarla) puede devolver stock en el backend;
  // invalidamos las queries de stock para que cualquier formulario ya
  // montado (ej. crear venta) refleje el stock actualizado de inmediato.
  const invalidateStockQueries = () => {
    queryClient.invalidateQueries({ queryKey: [WAREHOUSE_PRODUCT.QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [PRODUCT.QUERY_KEY] });
  };

  useEffect(() => {
    setOpen(true);
    setOpenMobile(true);
  }, []);

  const handleView = (id: number) => {
    navigate(`${GUIDE.ROUTE}/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeGuide(deleteId);
      await refetch();
      invalidateStockQueries();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const handleChangeStatus = (id: number, currentStatus: GuideStatus) => {
    if (!["DECLARADA", "EMITIDA"].includes(currentStatus)) {
      errorToast(
        "Solo se puede anular una guía con estado DECLARADA o EMITIDA",
        "Acción no disponible",
      );
      return;
    }
    setStatusChangeData({ id, currentStatus });
  };

  const handleGenerateSale = (guide: GuideResource) => {
    navigate(`/ventas/agregar?guide_id=${guide.id}`);
  };

  const handleDuplicate = (guide: GuideResource) => {
    navigate(`${GUIDE.ROUTE}/agregar`, { state: { duplicateFrom: guide } });
  };

  const confirmStatusChange = async (newStatus: GuideStatus) => {
    if (!statusChangeData) return;
    try {
      await changeStatus(statusChangeData.id, newStatus);
      await refetch();
      invalidateStockQueries();
      successToast("Guía anulada correctamente");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al actualizar el estado",
        "Error al cambiar el estado",
      );
    } finally {
      setStatusChangeData(null);
    }
  };

  // Construir el endpoint con query params para exportación
  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.append(key, String(value));
    });

    const queryString = params.toString();
    const baseExcelUrl = `${GUIDE_ENDPOINT}/export`;

    return queryString ? `${baseExcelUrl}?${queryString}` : baseExcelUrl;
  }, [filterParams]);

  // Columnas memorizadas: si se recrean en cada render, React remonta todas
  // las celdas y los tooltips/hover de las acciones parpadean.
  const columns = useMemo(
    () =>
      GuideColumns({
        onDelete: setDeleteId,
        onView: handleView,
        onChangeStatus: handleChangeStatus,
        onGenerateSale: handleGenerateSale,
        onDuplicate: handleDuplicate,
        onLinkOrder: setLinkOrderGuide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <GuideActions excelEndpoint={exportEndpoint} />
      </div>

      <GuideTable
        isLoading={isLoading}
        columns={columns}
        data={data?.data || []}
      >
        <GuideOptions filters={filters} onChange={handleFiltersChange} />
      </GuideTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {statusChangeData !== null && (
        <GuideStatusChangeDialog
          open={true}
          onOpenChange={(open) => !open && setStatusChangeData(null)}
          onConfirm={confirmStatusChange}
          currentStatus={statusChangeData.currentStatus}
        />
      )}

      <GuideLinkOrderDialog
        guide={linkOrderGuide}
        onClose={() => setLinkOrderGuide(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
