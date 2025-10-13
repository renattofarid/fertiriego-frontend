import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrder } from "../lib/purchase-order.hook";
import TitleComponent from "@/components/TitleComponent";
import PurchaseOrderActions from "./PurchaseOrderActions";
import PurchaseOrderTable from "./PurchaseOrderTable";
import PurchaseOrderOptions from "./PurchaseOrderOptions";
import { deletePurchaseOrder } from "../lib/purchase-order.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PurchaseOrderColumns } from "./PurchaseOrderColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PURCHASE_ORDER } from "../lib/purchase-order.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = PURCHASE_ORDER;

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = usePurchaseOrder();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
      ...(selectedStatus && { status: selectedStatus }),
    };
    refetch(filterParams);
  }, [page, search, per_page, selectedStatus, refetch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePurchaseOrder(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedStatus && { status: selectedStatus }),
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

  const handleCreatePurchaseOrder = () => {
    navigate("/ordenes-compra/agregar");
  };

  const handleEditPurchaseOrder = (id: number) => {
    navigate(`/ordenes-compra/actualizar/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <PurchaseOrderActions onCreatePurchaseOrder={handleCreatePurchaseOrder} />
      </div>

      <PurchaseOrderTable
        isLoading={isLoading}
        columns={PurchaseOrderColumns({
          onEdit: handleEditPurchaseOrder,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <PurchaseOrderOptions
          search={search}
          setSearch={setSearch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </PurchaseOrderTable>

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
