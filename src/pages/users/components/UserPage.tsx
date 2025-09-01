"use client";

import { useEffect, useState } from "react";
import PageSkeleton from "@/components/PageSkeleton";
import TitleComponent from "@/components/TitleComponent";
import UserOptions from "./UserOptions";
import UserTable from "./UserTable";
import { UserColumns } from "./UserColumns";
import UserActions from "./UserActions";
import { useUsers } from "../lib/User.hook";
import UserEditPage from "./UserEditPage";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { deleteUser } from "../lib/User.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import DataTablePagination from "@/components/DataTablePagination";
import { USER } from "../lib/User.interface";

const { MODEL, ICON } = USER;

export default function UserPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useUsers();

  useEffect(() => {
    refetch({ page, search });
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  // make pagination of 10 in data

  if (isLoading) return <PageSkeleton />;
  // if (!checkRouteExists("Users")) notFound();
  // if (!data) NotFound();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <UserActions />
      </div>

      <UserTable
        isLoading={isLoading}
        columns={UserColumns({ onEdit: setEditId, onDelete: setDeleteId })}
        data={data || []}
      >
        <UserOptions search={search} setSearch={setSearch} />
      </UserTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
      />

      {/* Formularios */}
      {editId !== null && (
        <UserEditPage id={editId} open={true} setOpen={() => setEditId(null)} />
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
