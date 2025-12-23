import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { DEBIT_NOTE } from "../lib/debit-note.interface";
import { useDebitNote } from "../lib/debit-note.hook";
import { deleteDebitNote } from "../lib/debit-note.actions";
import DebitNoteActions from "./DebitNoteActions";
import DebitNoteTable from "./DebitNoteTable";
import { DebitNoteColumns } from "./DebitNoteColumns";
import DebitNoteOptions from "./DebitNoteOptions";

const { MODEL, ICON } = DEBIT_NOTE;

export default function DebitNotePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useDebitNote();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDebitNote(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? error.response.data.error,
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
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <DebitNoteActions />
      </div>

      <DebitNoteTable
        isLoading={isLoading}
        columns={DebitNoteColumns({
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <DebitNoteOptions search={search} setSearch={setSearch} />
      </DebitNoteTable>

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
