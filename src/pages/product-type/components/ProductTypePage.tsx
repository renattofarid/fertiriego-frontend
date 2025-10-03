import { useEffect, useState } from "react";
import { useProductType } from "../lib/product-type.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductTypeActions from "./ProductTypeActions";
import ProductTypeTable from "./ProductTypeTable";
import ProductTypeModal from "./ProductTypeModal";
import { deleteProductType } from "../lib/product-type.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { ProductTypeColumns } from "./ProductTypeColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PRODUCT_TYPE } from "../lib/product-type.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import TypeUserOptions from "@/pages/type-users/components/TypeUserOptions";

const { MODEL, ICON, TITLES } = PRODUCT_TYPE;

export default function ProductTypePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<
    number | null
  >(null);

  const { data, meta, isLoading, refetch } = useProductType();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
    };
    refetch(filterParams);
  }, [page, search, per_page, refetch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductType(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
      };
      await refetch(filterParams);
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreateProductType = () => {
    setModalMode("create");
    setSelectedProductTypeId(null);
    setModalOpen(true);
  };

  const handleEditProductType = (id: number) => {
    setModalMode("update");
    setSelectedProductTypeId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProductTypeId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <ProductTypeActions onCreateProductType={handleCreateProductType} />
      </div>

      <ProductTypeTable
        isLoading={isLoading}
        columns={ProductTypeColumns({
          onEdit: handleEditProductType,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <TypeUserOptions search={search} setSearch={setSearch} />
      </ProductTypeTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {modalOpen && (
        <ProductTypeModal
          id={selectedProductTypeId || undefined}
          open={modalOpen}
          title={
            modalMode === "create" ? TITLES.create.title : TITLES.update.title
          }
          mode={modalMode}
          onClose={handleCloseModal}
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
