import { useEffect, useState } from "react";
import { useCompany } from "../lib/company.hook";
import TitleComponent from "@/components/TitleComponent";
import CompanyActions from "./CompanyActions";
import CompanyTable from "./CompanyTable";
import CompanyOptions from "./CompanyOptions";
import { deleteCompany } from "../lib/company.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { CompanyColumns } from "./CompanyColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { COMPANY } from "../lib/company.interface";
import CompanyModal from "./CompanyModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = COMPANY;

export default function CompanyPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useCompany();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCompany(deleteId);
      await refetch();
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
        <CompanyActions />
      </div>

      <CompanyTable
        isLoading={isLoading}
        columns={CompanyColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <CompanyOptions search={search} setSearch={setSearch} />
      </CompanyTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <CompanyModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={MODEL.name}
          mode="update"
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