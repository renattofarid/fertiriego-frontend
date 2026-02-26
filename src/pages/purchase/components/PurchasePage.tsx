import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchases } from "../lib/purchase.hook";
import TitleComponent from "@/components/TitleComponent";
import { PurchaseActions } from "./PurchaseActions";
import { PurchaseTable } from "./PurchaseTable";
import { PurchaseOptions } from "./PurchaseOptions";
import { usePurchaseStore } from "../lib/purchase.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import DataTablePagination from "@/components/DataTablePagination";
import type {
  PurchaseResource,
  PurchaseInstallmentResource,
} from "../lib/purchase.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PurchaseManagementSheet } from "./sheets/PurchaseManagementSheet";
import { InstallmentPaymentsSheet } from "./sheets/InstallmentPaymentsSheet";
import { useSidebar } from "@/components/ui/sidebar";

export const PurchasePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseResource | null>(null);
  const [isManagementSheetOpen, setIsManagementSheetOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<PurchaseInstallmentResource | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();
  const { data, isLoading, refetch } = usePurchases({
    page,
    per_page,
    search,
    status: selectedStatus,
    payment_type: selectedPaymentType,
  });
  const { removePurchase } = usePurchaseStore();

  useEffect(() => {
    setOpen(true);
    setOpenMobile(true);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, selectedStatus, selectedPaymentType]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removePurchase(deleteId);
      await refetch();
      successToast(
        SUCCESS_MESSAGE({ name: "Compra", gender: false }, "delete"),
      );
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
    // Validar que la suma de cuotas sea igual al total de la compra
    const totalAmount = parseFloat(purchase.total_amount);
    const sumOfInstallments =
      purchase.installments?.reduce(
        (sum, inst) => sum + parseFloat(inst.amount),
        0,
      ) || 0;

    if (Math.abs(totalAmount - sumOfInstallments) > 0.01) {
      errorToast(
        `No se puede realizar el pago rápido. La suma de las cuotas (${sumOfInstallments.toFixed(
          2,
        )}) no coincide con el total de la compra (${totalAmount.toFixed(
          2,
        )}). Por favor, sincronice las cuotas.`,
      );
      return;
    }

    // Tomar la primera cuota pendiente si existe
    const pendingInstallment = purchase.installments?.find(
      (inst) => parseFloat(inst.pending_amount) > 0,
    );

    if (pendingInstallment) {
      setSelectedInstallment(pendingInstallment);
      setIsPaymentSheetOpen(true);
    }
  };

  const handleCloseManagementSheet = async () => {
    setIsManagementSheetOpen(false);
    setSelectedPurchase(null);
    await refetch();
  };

  const handleClosePaymentSheet = async () => {
    setIsPaymentSheetOpen(false);
    setSelectedInstallment(null);
    await refetch();
  };

  const handlePaymentSuccess = async () => {
    await refetch();
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
        data={data?.data || []}
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
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
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
        onPurchaseUpdate={async () => {
          await refetch();
        }}
      />

      <InstallmentPaymentsSheet
        open={isPaymentSheetOpen}
        onClose={handleClosePaymentSheet}
        installment={selectedInstallment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
