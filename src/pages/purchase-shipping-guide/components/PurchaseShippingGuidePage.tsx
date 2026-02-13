import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseShippingGuide } from "../lib/purchase-shipping-guide.hook";
import TitleComponent from "@/components/TitleComponent";
import { PurchaseShippingGuideActions } from "./PurchaseShippingGuideActions";
import { PurchaseShippingGuideTable } from "./PurchaseShippingGuideTable";
import { PurchaseShippingGuideOptions } from "./PurchaseShippingGuideOptions";
import { usePurchaseShippingGuideStore } from "../lib/purchase-shipping-guide.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import DataTablePagination from "@/components/DataTablePagination";
import type { PurchaseShippingGuideResource } from "../lib/purchase-shipping-guide.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { errorToast } from "@/lib/core.function";
import { AssignPurchaseModal } from "./AssignPurchaseModal";

export const PurchaseShippingGuidePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedGuide, setSelectedGuide] =
    useState<PurchaseShippingGuideResource | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data, meta, isLoading, refetch } = usePurchaseShippingGuide();
  const { removeGuide, assignPurchaseToGuide, isSubmitting } =
    usePurchaseShippingGuideStore();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
      ...(selectedStatus && { status: selectedStatus }),
    };
    refetch(filterParams);
  }, [page, search, per_page, selectedStatus]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeGuide(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedStatus && { status: selectedStatus }),
      };
      await refetch(filterParams);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar la guía";
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreateGuide = () => {
    navigate("/guias-compra/agregar");
  };

  const handleEditGuide = (guide: PurchaseShippingGuideResource) => {
    navigate(`/guias-compra/actualizar/${guide.id}`);
  };

  const handleViewDetails = (guide: PurchaseShippingGuideResource) => {
    navigate(`/guias-compra/detalle/${guide.id}`);
  };

  const handleAssignPurchase = (guide: PurchaseShippingGuideResource) => {
    setSelectedGuide(guide);
    setIsAssignModalOpen(true);
  };

  const handleAssignPurchaseSubmit = async (purchaseId: number) => {
    if (!selectedGuide) return;
    try {
      await assignPurchaseToGuide(selectedGuide.id, purchaseId);
      setIsAssignModalOpen(false);
      setSelectedGuide(null);
      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedStatus && { status: selectedStatus }),
      };
      await refetch(filterParams);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al asignar la compra");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title="Guías de Compra"
          subtitle="Gestión de guías de remisión"
          icon="Truck"
        />
        <PurchaseShippingGuideActions onCreateGuide={handleCreateGuide} />
      </div>

      <PurchaseShippingGuideTable
        data={data || []}
        onEdit={handleEditGuide}
        onDelete={setDeleteId}
        onViewDetails={handleViewDetails}
        onAssignPurchase={handleAssignPurchase}
        isLoading={isLoading}
      >
        <PurchaseShippingGuideOptions
          search={search}
          setSearch={setSearch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </PurchaseShippingGuideTable>

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

      <AssignPurchaseModal
        open={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedGuide(null);
        }}
        onSubmit={handleAssignPurchaseSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
