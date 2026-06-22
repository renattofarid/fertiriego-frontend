import { useState } from "react";
import { useProductTag } from "../lib/product-tag.hook";
import TitleComponent from "@/components/TitleComponent";
import TagActions from "./TagActions";
import TagTable from "./TagTable";
import TagOptions from "./TagOptions";
import { deleteTag } from "../lib/product-tag.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { TagColumns } from "./TagColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PRODUCT_TAG } from "../lib/product-tag.interface";
import TagModal from "./TagModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = PRODUCT_TAG;

export default function TagPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedType, setSelectedType] = useState("");
  const [selectedActive, setSelectedActive] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useProductTag({
    page,
    search,
    per_page,
    ...(selectedType && { type: selectedType }),
    ...(selectedActive !== "" && { is_active: selectedActive === "1" }),
  });

  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTag(deleteId);
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
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <TagActions />
      </div>

      <TagTable
        isLoading={isLoading}
        columns={TagColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <TagOptions
          search={search}
          setSearch={setSearch}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedActive={selectedActive}
          setSelectedActive={setSelectedActive}
        />
      </TagTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <TagModal
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
