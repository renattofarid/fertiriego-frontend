import { useState } from "react";
import { useBrand } from "../lib/brand.hook";
import TitleComponent from "@/components/TitleComponent";
import BrandActions from "./BrandActions";
import BrandTable from "./BrandTable";
import BrandOptions from "./BrandOptions";
import { deleteBrand } from "../lib/brand.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { BrandColumns } from "./BrandColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { BRAND } from "../lib/brand.interface";
import BrandModal from "./BrandModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = BRAND;

export default function BrandPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, isLoading, refetch } = useBrand({ page, search, per_page });

  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBrand(deleteId);
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
        <BrandActions />
      </div>

      <BrandTable
        isLoading={isLoading}
        columns={BrandColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <BrandOptions search={search} setSearch={setSearch} />
      </BrandTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <BrandModal
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