import { useEffect, useState } from "react";
import { usePermissions } from "../lib/permission.hook";
import TitleComponent from "@/components/TitleComponent";
import PermissionActions from "./PermissionActions";
import PermissionTable from "./PermissionTable";
import PermissionOptions from "./PermissionOptions";
import { deletePermission } from "../lib/permission.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PermissionColumns } from "./PermissionColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PERMISSION } from "../lib/permission.interface";
import PermissionModal from "./PermissionModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = PERMISSION;

export default function PermissionPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = usePermissions();

  useEffect(() => {
    refetch({ page, search, per_page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePermission(deleteId);
      await refetch({ page, search, per_page });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? error.response?.data?.error,
        ERROR_MESSAGE(MODEL, "delete")
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <PermissionActions />
      </div>

      <PermissionTable
        isLoading={isLoading}
        columns={PermissionColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <PermissionOptions search={search} setSearch={setSearch} />
      </PermissionTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <PermissionModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={`Editar ${MODEL.name}`}
          mode="edit"
        />
      )}

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
