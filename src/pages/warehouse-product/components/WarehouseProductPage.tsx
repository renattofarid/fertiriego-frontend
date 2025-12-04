import { useEffect, useState } from "react";
import { useWarehouseProduct } from "../lib/warehouse-product.hook";
import TitleComponent from "@/components/TitleComponent";
import WarehouseProductActions from "./WarehouseProductActions";
import WarehouseProductTable from "./WarehouseProductTable";
import WarehouseProductOptions from "./WarehouseProductOptions";
import { deleteWarehouseProduct } from "../lib/warehouse-product.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { WarehouseProductColumns } from "./WarehouseProductColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { WAREHOUSE_PRODUCT } from "../lib/warehouse-product.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ICON } = WAREHOUSE_PRODUCT;

export default function WarehouseProductPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  // const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useWarehouseProduct();

  const { data: warehouses = [], isLoading: loadingWarehouses } =
    useAllWarehouses();
  const { data: products = [], isLoading: loadingProducts } = useAllProducts();

  useEffect(() => {
    const params: Record<string, any> = { page, search, per_page };
    if (warehouseId) params.warehouse_id = warehouseId;
    if (productId) params.product_id = productId;
    refetch(params);
  }, [page, search, per_page, warehouseId, productId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWarehouseProduct(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? error.response.data.error,
        ERROR_MESSAGE(MODEL, "delete")
      );
    } finally {
      setDeleteId(null);
    }
  };

  if (loadingWarehouses || loadingProducts || !warehouses || !products) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural || MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <WarehouseProductActions />
      </div>

      <WarehouseProductTable
        isLoading={isLoading}
        columns={WarehouseProductColumns({
          // onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <WarehouseProductOptions
          search={search}
          setSearch={setSearch}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          productId={productId}
          setProductId={setProductId}
          warehouses={warehouses}
          products={products}
        />
      </WarehouseProductTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
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
