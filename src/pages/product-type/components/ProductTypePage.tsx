import { useEffect, useState, useMemo } from "react";
import { useProductTypeLocalStorage } from "../lib/product-type-localStorage.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductTypeActions from "./ProductTypeActions";
import ProductTypeTable from "./ProductTypeTable";
import ProductTypeModal from "./ProductTypeModal";
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

  const { productTypes, isLoading, fetchAll, remove } = useProductTypeLocalStorage();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filtrar y paginar los datos en el cliente
  const filteredData = useMemo(() => {
    if (!productTypes) return [];

    let filtered = productTypes;

    // Aplicar búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (pt) =>
          pt.name.toLowerCase().includes(searchLower) ||
          pt.code.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [productTypes, search]);

  // Calcular paginación
  const paginatedData = useMemo(() => {
    const start = (page - 1) * per_page;
    const end = start + per_page;
    return filteredData.slice(start, end);
  }, [filteredData, page, per_page]);

  const totalPages = Math.ceil(filteredData.length / per_page);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      fetchAll();
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
        data={paginatedData}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </ProductTypeTable>

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={filteredData.length}
      />

      {modalOpen && (
        <ProductTypeModal
          id={selectedProductTypeId || undefined}
          open={modalOpen}
          title={modalMode === "create" ? TITLES.create.title : TITLES.update.title}
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
