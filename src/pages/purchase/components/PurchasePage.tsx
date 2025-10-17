import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchase } from "../lib/purchase.hook";
import TitleComponent from "@/components/TitleComponent";
import { PurchaseActions } from "./PurchaseActions";
import { PurchaseTable } from "./PurchaseTable";
import { PurchaseOptions } from "./PurchaseOptions";
import { usePurchaseStore } from "../lib/purchase.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import DataTablePagination from "@/components/DataTablePagination";
import type { PurchaseResource, PurchaseInstallmentResource } from "../lib/purchase.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { ERROR_MESSAGE, errorToast, SUCCESS_MESSAGE, successToast } from "@/lib/core.function";
import { PurchaseManagementSheet } from "./sheets/PurchaseManagementSheet";
import { InstallmentPaymentsSheet } from "./sheets/InstallmentPaymentsSheet";

export const PurchasePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseResource | null>(null);
  const [isManagementSheetOpen, setIsManagementSheetOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<PurchaseInstallmentResource | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const { data, meta, isLoading, refetch } = usePurchase();
  const { removePurchase } = usePurchaseStore();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
      ...(selectedStatus && { status: selectedStatus }),
      ...(selectedPaymentType && { payment_type: selectedPaymentType }),
    };
    refetch(filterParams);
  }, [page, search, per_page, selectedStatus, selectedPaymentType]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removePurchase(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedPaymentType && { payment_type: selectedPaymentType }),
      };
      await refetch(filterParams);
      successToast(SUCCESS_MESSAGE({ name: "Compra", gender: false }, "delete"));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ?? ERROR_MESSAGE;
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreatePurchase = () => {
    navigate("/compras/agregar");
  };

  const handleEditPurchase = (purchase: PurchaseResource) => {
    navigate(`/compras/actualizar/${purchase.id}`);
  };

  const handleViewDetails = (purchase: PurchaseResource) => {
    navigate(`/compras/detalle/${purchase.id}`);
  };

  const handleManage = (purchase: PurchaseResource) => {
    setSelectedPurchase(purchase);
    setIsManagementSheetOpen(true);
  };

  const handleQuickPay = (purchase: PurchaseResource) => {
    // Tomar la primera cuota pendiente si existe
    const pendingInstallment = purchase.installments?.find(
      (inst) => parseFloat(inst.pending_amount) > 0
    );

    if (pendingInstallment) {
      setSelectedInstallment(pendingInstallment);
      setIsPaymentSheetOpen(true);
    }
  };

  const handleCloseManagementSheet = () => {
    setIsManagementSheetOpen(false);
    setSelectedPurchase(null);
    const filterParams = {
      page,
      search,
      per_page,
      ...(selectedStatus && { status: selectedStatus }),
      ...(selectedPaymentType && { payment_type: selectedPaymentType }),
    };
    refetch(filterParams);
  };

  const handleClosePaymentSheet = () => {
    setIsPaymentSheetOpen(false);
    setSelectedInstallment(null);
    const filterParams = {
      page,
      search,
      per_page,
      ...(selectedStatus && { status: selectedStatus }),
      ...(selectedPaymentType && { payment_type: selectedPaymentType }),
    };
    refetch(filterParams);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title="Compras"
          subtitle="Gestión de compras y pagos"
          icon="ShoppingCart"
        />
        <PurchaseActions onCreatePurchase={handleCreatePurchase} />
      </div>

      <PurchaseTable
        data={data || []}
        onEdit={handleEditPurchase}
        onDelete={setDeleteId}
        onViewDetails={handleViewDetails}
        onManage={handleManage}
        onQuickPay={handleQuickPay}
        isLoading={isLoading}
      >
        <PurchaseOptions
          search={search}
          setSearch={setSearch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPaymentType={selectedPaymentType}
          setSelectedPaymentType={setSelectedPaymentType}
        />
      </PurchaseTable>

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

      <PurchaseManagementSheet
        open={isManagementSheetOpen}
        onClose={handleCloseManagementSheet}
        purchase={selectedPurchase}
      />

      <InstallmentPaymentsSheet
        open={isPaymentSheetOpen}
        onClose={handleClosePaymentSheet}
        installment={selectedInstallment}
      />
    </div>
  );
};
