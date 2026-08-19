import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import IncomeActions from "./IncomeActions";
import IncomeAddModal from "./IncomeAddModal";
import { IncomeColumns } from "./IncomeColumns";
import { useIncomes } from "../lib/income.hook";
import { deleteIncome } from "../lib/income.actions";
import { INCOME } from "../lib/income.interface";

const { MODEL, ICON } = INCOME;

export default function IncomePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useIncomes({ search, page, per_page });

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteIncome(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          ERROR_MESSAGE(MODEL, "delete"),
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
        <IncomeActions onAdd={() => setOpenAdd(true)} />
      </div>

      <DataTable
        columns={IncomeColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
        isLoading={isLoading}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por trabajador o concepto..."
        />
      </DataTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      <IncomeAddModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          setOpenAdd(false);
          refetch();
        }}
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
