import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../lib/product.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductActions from "./ProductActions";
import ProductTable from "./ProductTable";
import ProductOptions from "./ProductOptions";
import { ProductForm } from "./ProductForm";
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
import { PRODUCT, type ProductResource } from "../lib/product.interface";
import { useProductStore } from "../lib/product.store";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductSchema } from "../lib/product.schema";

const { MODEL, ICON } = PRODUCT;

type ViewMode = "list" | "create" | "edit";

export default function ProductPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useProduct();
  const { data: categories } = useAllCategories();
  const { data: brands } = useAllBrands();
  const { data: units } = useAllUnits();
  const { isSubmitting, createProduct, updateProduct, fetchProduct, product } =
    useProductStore();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
      ...(selectedCategory && { category_id: selectedCategory }),
      ...(selectedBrand && { brand_id: selectedBrand }),
      ...(selectedType && { product_type: selectedType }),
    };
    refetch(filterParams);
  }, [
    page,
    search,
    per_page,
    selectedCategory,
    selectedBrand,
    selectedType,
    refetch,
  ]);

  useEffect(() => {
    if (selectedProductId && viewMode === "edit") {
      fetchProduct(selectedProductId);
    }
  }, [selectedProductId, viewMode, fetchProduct]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(selectedBrand && { brand_id: selectedBrand }),
        ...(selectedType && { product_type: selectedType }),
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

  const handleCreateProduct = () => {
    setViewMode("create");
    setSelectedProductId(null);
  };

  const handleEditProduct = (id: number) => {
    setSelectedProductId(id);
    setViewMode("edit");
  };

  const handleViewProduct = (id: number) => {
    navigate(`/productos/${id}`);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProductId(null);
  };


  const getDefaultValues = (): Partial<ProductSchema> => ({
    name: "",
    category_id: undefined,
    brand_id: undefined,
    unit_id: undefined,
    product_type: "",
    technical_sheet: [],
  });

  const mapProductToForm = (data: ProductResource): Partial<ProductSchema> => ({
    name: data.name,
    category_id: data.category_id,
    brand_id: data.brand_id,
    unit_id: data.unit_id,
    product_type: data.product_type,
    technical_sheet: [], // Files are handled separately
  });

  const handleSubmit = async (data: ProductSchema) => {
    try {
      if (viewMode === "create") {
        await createProduct(data);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else if (viewMode === "edit" && selectedProductId) {
        await updateProduct(selectedProductId, data);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }

      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(selectedBrand && { brand_id: selectedBrand }),
        ...(selectedType && { product_type: selectedType }),
      };
      await refetch(filterParams);
      handleBackToList();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGE(MODEL, viewMode === "create" ? "create" : "update");
      errorToast(errorMessage);
    }
  };


  // Render form view (create/edit)
  const renderFormView = () => {
    const isEdit = viewMode === "edit";
    const defaultValues =
      isEdit && product ? mapProductToForm(product) : getDefaultValues();

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isEdit ? "Editar Producto" : "Crear Nuevo Producto"}
            </CardTitle>
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories && brands && units && (
            <ProductForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              mode={isEdit ? "update" : "create"}
              categories={categories}
              brands={brands}
              units={units}
              product={isEdit ? product || undefined : undefined}
              onCancel={handleBackToList}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  // Render list view
  const renderListView = () => (
    <>
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
        })}
        data={data || []}
      >
        {categories && brands && (
          <ProductOptions
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            categories={categories}
            brands={brands}
          />
        )}
      </ProductTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />
    </>
  );

  return (
    <div className="space-y-4">
      {viewMode === "list" && renderListView()}
      {(viewMode === "create" || viewMode === "edit") && renderFormView()}

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
