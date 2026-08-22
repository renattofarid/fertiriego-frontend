import { useEffect, useState } from "react";
import { useMenuGroups, useAllMenuGroups } from "../lib/menuGroup.hook";
import TitleComponent from "@/components/TitleComponent";
import MenuGroupActions from "./MenuGroupActions";
import MenuGroupTable from "./MenuGroupTable";
import MenuGroupOptions from "./MenuGroupOptions";
import { deleteMenuGroup } from "../lib/menuGroup.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { MenuGroupColumns } from "./MenuGroupColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { MENU_GROUP } from "../lib/menuGroup.interface";
import MenuGroupModal from "./MenuGroupModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = MENU_GROUP;

export default function MenuGroupPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useMenuGroups();
  const allMenuGroups = useAllMenuGroups();

  useEffect(() => {
    refetch({ page, search, per_page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMenuGroup(deleteId);
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
        <MenuGroupActions />
      </div>

      <MenuGroupTable
        isLoading={isLoading}
        columns={MenuGroupColumns({
          allMenuGroups,
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <MenuGroupOptions search={search} setSearch={setSearch} />
      </MenuGroupTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <MenuGroupModal
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
