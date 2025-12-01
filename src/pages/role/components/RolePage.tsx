import { useEffect, useState } from "react";
import { useRoles } from "../lib/role.hook";
import TitleComponent from "@/components/TitleComponent";
import RoleActions from "./RoleActions";
import RoleTable from "./RoleTable";
import RoleOptions from "./RoleOptions";
import { deleteRole } from "../lib/role.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { RoleColumns } from "./RoleColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { ROLE } from "../lib/role.interface";
import RoleModal from "./RoleModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = ROLE;

export default function RolePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useRoles();

  useEffect(() => {
    refetch({ params: { page, search, per_page } });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRole(deleteId);
      await refetch({ params: { page, search, per_page } });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast((error.response.data.message ?? error.response.data.error), ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <RoleActions />
      </div>

      <RoleTable
        isLoading={isLoading}
        columns={RoleColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <RoleOptions search={search} setSearch={setSearch} />
      </RoleTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <RoleModal
          roleId={editId}
          open={true}
          onOpenChange={(open) => !open && setEditId(null)}
          onSuccess={() => {
            setEditId(null);
            refetch({ params: { page } });
          }}
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
