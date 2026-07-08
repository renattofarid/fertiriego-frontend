import { useEffect, useState } from "react";
import { useCreditNote } from "../lib/credit-note.hook";
import TitleComponent from "@/components/TitleComponent";
import CreditNoteActions from "./CreditNoteActions";
import CreditNoteTable from "./CreditNoteTable";
import CreditNoteOptions from "./CreditNoteOptions";
import { deleteCreditNote } from "../lib/credit-note.actions";
import type { GetCreditNotesParams } from "../lib/credit-note.actions";
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
  const [issueStartDate, setIssueStartDate] = useState("");
  const [issueEndDate, setIssueEndDate] = useState("");
  const [creditNoteMotiveId, setCreditNoteMotiveId] = useState("");
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [saleId, setSaleId] = useState("");
  const [affectsStock, setAffectsStock] = useState("");
  const [createdStartDate, setCreatedStartDate] = useState("");
  const [createdEndDate, setCreatedEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useCreditNote();

  const issueDateFilterKey =
    issueStartDate && issueEndDate ? `${issueStartDate},${issueEndDate}` : "";
  const createdAtFilterKey =
    createdStartDate && createdEndDate
      ? `${createdStartDate},${createdEndDate}`
      : "";
  const issueDateFilter = issueDateFilterKey
    ? [issueStartDate, issueEndDate]
    : undefined;
  const createdAtFilter = createdAtFilterKey
    ? [createdStartDate, createdEndDate]
    : undefined;

  const filters: GetCreditNotesParams = {
    page,
    per_page,
    full_document_number: search || undefined,
    issue_date: issueDateFilter,
    credit_note_motive_id: creditNoteMotiveId
      ? Number(creditNoteMotiveId)
      : undefined,
    status: status || undefined,
    customer_id: customerId ? Number(customerId) : undefined,
    sale_id: saleId ? Number(saleId) : undefined,
    affects_stock: affectsStock || undefined,
    created_at: createdAtFilter,
  };

  useEffect(() => {
    refetch(filters);
  }, [
    page,
    per_page,
    search,
    issueDateFilterKey,
    creditNoteMotiveId,
    status,
    customerId,
    saleId,
    affectsStock,
    createdAtFilterKey,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    per_page,
    search,
    issueDateFilterKey,
    creditNoteMotiveId,
    status,
    customerId,
    saleId,
    affectsStock,
    createdAtFilterKey,
  ]);

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
        <CreditNoteActions
          search={search}
          issueDate={issueDateFilter}
          creditNoteMotiveId={creditNoteMotiveId}
          status={status}
          customerId={customerId}
          saleId={saleId}
          affectsStock={affectsStock}
          createdAt={createdAtFilter}
        />
      </div>

      <CreditNoteTable
        isLoading={isLoading}
        columns={CreditNoteColumns({
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <CreditNoteOptions
          search={search}
          setSearch={setSearch}
          issueStartDate={issueStartDate}
          setIssueStartDate={setIssueStartDate}
          issueEndDate={issueEndDate}
          setIssueEndDate={setIssueEndDate}
          creditNoteMotiveId={creditNoteMotiveId}
          setCreditNoteMotiveId={setCreditNoteMotiveId}
          status={status}
          setStatus={setStatus}
          customerId={customerId}
          setCustomerId={setCustomerId}
          saleId={saleId}
          setSaleId={setSaleId}
          affectsStock={affectsStock}
          setAffectsStock={setAffectsStock}
          createdStartDate={createdStartDate}
          setCreatedStartDate={setCreatedStartDate}
          createdEndDate={createdEndDate}
          setCreatedEndDate={setCreatedEndDate}
        />
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
