import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGuides } from "../lib/guide.hook";
import TitleComponent from "@/components/TitleComponent";
import GuideActions from "./GuideActions";
import GuideTable from "./GuideTable";
import GuideOptions from "./GuideOptions";
import { useGuideStore } from "../lib/guide.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { GuideColumns } from "./GuideColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { GUIDE } from "../lib/guide.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

const { MODEL, ICON } = GUIDE;

export default function GuidePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { user } = useAuthStore();

  const { data, meta, isLoading, refetch } = useGuides({
    company_id: user?.company_id,
    page,
    search,
    per_page,
  });
  const { removeGuide } = useGuideStore();

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

  // Construir el endpoint con query params para exportación
  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();

    if (user?.company_id) {
      params.append("company_id", user.company_id.toString());
    }

    const queryString = params.toString();
    const baseExcelUrl = "/guide/export";

    return queryString ? `${baseExcelUrl}?${queryString}` : baseExcelUrl;
  }, [user?.company_id]);

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
    </div>
  );
}
