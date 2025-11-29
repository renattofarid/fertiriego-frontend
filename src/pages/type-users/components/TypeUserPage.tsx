import { useEffect, useState } from "react";
import { useTypeUsers } from "../lib/typeUser.hook";
import TitleComponent from "@/components/TitleComponent";
import TypeUserActions from "./TypeUserActions";
import TypeUserTable from "./TypeUserTable";
import TypeUserOptions from "./TypeUserOptions";
import { deleteTypeUser } from "../lib/typeUser.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { TypeUserColumns } from "./TypeUserColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { TYPE_USER } from "../lib/typeUser.interface";
import TypeUserModal from "./TypeUserModal";
import { TypeUserAccess } from "@/pages/menu/components/TypeUserAccess";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = TYPE_USER;

export default function TypeUserPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useTypeUsers();
  const [permissionId, setPermissionId] = useState<number | null>(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypeUser(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast((error.response.data.message ?? error.response.data.error), ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const handleAccessDialog = (id: number | null) => {
    if (!id) return;
    setPermissionId(id);
    setAccessDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <TypeUserActions />
      </div>

      {/* Tabla */}
      <TypeUserTable
        isLoading={isLoading}
        columns={TypeUserColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
          onPermissions: handleAccessDialog,
        })}
        data={data || []}
      >
        <TypeUserOptions search={search} setSearch={setSearch} />
      </TypeUserTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {/* Formularios */}
      {editId !== null && (
        <TypeUserModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={`Editar ${MODEL.name}`}
          mode="update"
        />
      )}

      {/* Permisos */}
      {accessDialogOpen && permissionId && (
        <TypeUserAccess
          id={permissionId}
          open={accessDialogOpen}
          setOpen={(o) => {
            setAccessDialogOpen(o);
            if (!o) {
              setTimeout(() => setPermissionId(null), 300);
              setAccessDialogOpen(false);
            }
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
