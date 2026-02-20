import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../lib/product.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductActions from "./ProductActions";
import ProductTable from "./ProductTable";
import ProductOptions from "./ProductOptions";
import { deleteProduct } from "../lib/product.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { ProductColumns } from "./ProductColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PRODUCT } from "../lib/product.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import WarehouseProductModal from "@/pages/warehouse-product/components/WarehouseProductModal";

const { MODEL, ICON } = PRODUCT;

export default function ProductPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignStockProductId, setAssignStockProductId] = useState<
    number | null
  >(null);

  const { data, isLoading, refetch } = useProduct({
    page,
    search,
    per_page,
    ...(selectedCategory && { category_id: selectedCategory }),
    ...(selectedBrand && { brand_id: selectedBrand }),
    ...(selectedType && { product_type: selectedType }),
  });

  useEffect(() => {
    setPage(1);
  }, [
    search,
    per_page,
    selectedCategory,
    selectedBrand,
    selectedType,
    refetch,
  ]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreateProduct = () => {
    navigate("/productos/agregar");
  };

  const handleEditProduct = (id: number) => {
    navigate(`/productos/actualizar/${id}`);
  };

  const handleViewProduct = (id: number) => {
    navigate(`/productos/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <ProductActions onCreateProduct={handleCreateProduct} />
      </div>

      <ProductTable
        isLoading={isLoading}
        columns={ProductColumns({
          onEdit: handleEditProduct,
          onDelete: setDeleteId,
          onView: handleViewProduct,
          onAssignStock: setAssignStockProductId,
        })}
        data={data?.data || []}
      >
        <ProductOptions
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
      </ProductTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {assignStockProductId !== null && (
        <WarehouseProductModal
          open={true}
          onClose={() => setAssignStockProductId(null)}
          title="Asignar Producto a Almacén"
          mode="create"
          preselectedProductId={assignStockProductId}
        />
      )}
    </div>
  );
}
