import { useEffect, useState } from "react";
import { useProduct } from "../lib/product.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductActions from "./ProductActions";
import ProductTable from "./ProductTable";
import ProductOptions from "./ProductOptions";
import { ProductForm } from "./ProductForm";
import { deleteProduct, deleteTechnicalSheet } from "../lib/product.actions";
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
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProductSchema } from "../lib/product.schema";

const { MODEL, ICON } = PRODUCT;

type ViewMode = "list" | "create" | "edit" | "view";

export default function ProductPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [deleteSheetValue, setDeleteSheetValue] = useState<string | null>(null);

  const { data, meta, isLoading, refetch } = useProduct();
  const { data: categories } = useAllCategories();
  const { data: brands } = useAllBrands();
  const { data: units } = useAllUnits();
  const {
    isSubmitting,
    createProduct,
    updateProduct,
    fetchProduct,
    product
  } = useProductStore();

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
  }, [page, search, per_page, selectedCategory, selectedBrand, selectedType, refetch]);

  useEffect(() => {
    if (selectedProductId && (viewMode === "edit" || viewMode === "view")) {
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
      const errorMessage = error instanceof Error
        ? error.message
        : ERROR_MESSAGE(MODEL, "delete");
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
    setSelectedProductId(id);
    setViewMode("view");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProductId(null);
  };

  const handleDeleteTechnicalSheet = async () => {
    if (!deleteSheetValue || !selectedProductId) return;
    try {
      await deleteTechnicalSheet(selectedProductId, { value: deleteSheetValue });
      await fetchProduct(selectedProductId); // Refresh product data
      successToast("Ficha técnica eliminada exitosamente");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Error al eliminar la ficha técnica";
      errorToast(errorMessage);
    } finally {
      setDeleteSheetValue(null);
    }
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
      const errorMessage = error instanceof Error
        ? error.message
        : ERROR_MESSAGE(MODEL, viewMode === "create" ? "create" : "update");
      errorToast(errorMessage);
    }
  };

  // Render product details view
  const renderProductDetails = () => {
    if (!product) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalles del Producto
            </CardTitle>
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <div className="mt-1">
                <Badge variant="outline">{product.product_type}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Categoría</label>
              <p>{product.category_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Marca</label>
              <p>{product.brand_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Unidad</label>
              <p>{product.unit_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
              <p>{new Date(product.created_at).toLocaleDateString("es-ES")}</p>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Fichas Técnicas</label>
            <div className="mt-2 space-y-2">
              {product.technical_sheet.length > 0 ? (
                product.technical_sheet.map((sheet, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{sheet.split('/').pop()}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(sheet, '_blank')}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteSheetValue(sheet)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No hay fichas técnicas</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Imágenes del Producto</label>
            <div className="mt-2">
              {product.product_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {product.product_images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay imágenes</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render form view (create/edit)
  const renderFormView = () => {
    const isEdit = viewMode === "edit";
    const defaultValues = isEdit && product ? mapProductToForm(product) : getDefaultValues();

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
      {viewMode === "view" && renderProductDetails()}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {deleteSheetValue !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteSheetValue(null)}
          onConfirm={handleDeleteTechnicalSheet}
        />
      )}
    </div>
  );
}