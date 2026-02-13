import { useEffect, useState } from "react";
import { useUserBoxAssignment } from "../lib/userboxassignment.hook";
import TitleComponent from "@/components/TitleComponent";
import UserBoxAssignmentActions from "./UserBoxAssignmentActions";
import UserBoxAssignmentTable from "./UserBoxAssignmentTable";
import UserBoxAssignmentOptions from "./UserBoxAssignmentOptions";
import { deleteUserBoxAssignment } from "../lib/userboxassignment.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { UserBoxAssignmentColumns } from "./UserBoxAssignmentColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { USERBOXASSIGNMENT } from "../lib/userboxassignment.interface";
import UserBoxAssignmentModal from "./UserBoxAssignmentModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = USERBOXASSIGNMENT;

export default function UserBoxAssignmentPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useUserBoxAssignment();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUserBoxAssignment(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
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
        <UserBoxAssignmentActions />
      </div>

      <UserBoxAssignmentTable
        isLoading={isLoading}
        columns={UserBoxAssignmentColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <UserBoxAssignmentOptions search={search} setSearch={setSearch} />
      </UserBoxAssignmentTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <UserBoxAssignmentModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={MODEL.name}
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
