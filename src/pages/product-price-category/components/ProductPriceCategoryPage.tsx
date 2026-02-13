import { useEffect, useState } from "react";
import { useProductPriceCategory } from "../lib/product-price-category.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductPriceCategoryActions from "./ProductPriceCategoryActions";
import ProductPriceCategoryTable from "./ProductPriceCategoryTable";
import ProductPriceCategoryOptions from "./ProductPriceCategoryOptions";
import { deleteProductPriceCategory } from "../lib/product-price-category.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { ProductPriceCategoryColumns } from "./ProductPriceCategoryColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PRODUCT_PRICE_CATEGORY } from "../lib/product-price-category.interface";
import ProductPriceCategoryModal from "./ProductPriceCategoryModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = PRODUCT_PRICE_CATEGORY;

export default function ProductPriceCategoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useProductPriceCategory();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductPriceCategory(deleteId);
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
        <ProductPriceCategoryActions />
      </div>

      <ProductPriceCategoryTable
        isLoading={isLoading}
        columns={ProductPriceCategoryColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <ProductPriceCategoryOptions search={search} setSearch={setSearch} />
      </ProductPriceCategoryTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <ProductPriceCategoryModal
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
