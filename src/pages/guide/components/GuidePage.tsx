import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGuides } from "../lib/guide.hook";
import TitleComponent from "@/components/TitleComponent";
import GuideActions from "./GuideActions";
import GuideTable from "./GuideTable";
import GuideOptions from "./GuideOptions";
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
import DataTablePagination from "@/components/DataTablePagination";
import { GUIDE, type GuideStatus, type GuideResource } from "../lib/guide.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = GUIDE;

export default function GuidePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusChangeData, setStatusChangeData] = useState<{
    id: number;
    currentStatus: GuideStatus;
  } | null>(null);

  const { data, meta, isLoading, refetch } = useGuides({
    page,
    search,
    per_page,
  });
  const { removeGuide, changeStatus } = useGuideStore();

  const handleEdit = (id: number) => {
    navigate(`${GUIDE.ROUTE}/actualizar/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`${GUIDE.ROUTE}/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeGuide(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const handleChangeStatus = (id: number, currentStatus: GuideStatus) => {
    setStatusChangeData({ id, currentStatus });
  };

  const handleGenerateSale = (guide: GuideResource) => {
    navigate(`/ventas/agregar?guide_id=${guide.id}`);
  };

  const confirmStatusChange = async (newStatus: GuideStatus) => {
    if (!statusChangeData) return;
    try {
      await changeStatus(statusChangeData.id, newStatus);
      await refetch();
      successToast(`Estado actualizado a ${newStatus}`);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al actualizar el estado",
        "Error al cambiar el estado"
      );
    } finally {
      setStatusChangeData(null);
    }
  };

  // Construir el endpoint con query params para exportación
  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();

    const queryString = params.toString();
    const baseExcelUrl = "/guide/export";

    return queryString ? `${baseExcelUrl}?${queryString}` : baseExcelUrl;
  }, []);

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
        columns={GuideColumns({
          onEdit: handleEdit,
          onDelete: setDeleteId,
          onView: handleView,
          onChangeStatus: handleChangeStatus,
          onGenerateSale: handleGenerateSale,
        })}
        data={data || []}
      >
        <GuideOptions search={search} setSearch={setSearch} />
      </GuideTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
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
    </div>
  );
}
