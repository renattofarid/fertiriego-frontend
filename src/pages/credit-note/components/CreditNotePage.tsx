import { useEffect, useState } from "react";
import { useCreditNote } from "../lib/credit-note.hook";
import TitleComponent from "@/components/TitleComponent";
import CreditNoteActions from "./CreditNoteActions";
import CreditNoteTable from "./CreditNoteTable";
import CreditNoteOptions from "./CreditNoteOptions";
import { deleteCreditNote } from "../lib/credit-note.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { CreditNoteColumns } from "./CreditNoteColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = CREDIT_NOTE;

export default function CreditNotePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useCreditNote();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCreditNote(deleteId);
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
        <CreditNoteActions />
      </div>

      <CreditNoteTable
        isLoading={isLoading}
        columns={CreditNoteColumns({
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <CreditNoteOptions search={search} setSearch={setSearch} />
      </CreditNoteTable>

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
