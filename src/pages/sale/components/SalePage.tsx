"use client";

import { useEffect, useState } from "react";
import { useSale } from "../lib/sale.hook";
import SaleTable from "./SaleTable";
import SaleOptions from "./SaleOptions";
import SaleActions from "./SaleActions";
import { getSaleColumns } from "./SaleColumns";
import { useSaleStore } from "../lib/sales.store";
import { useNavigate } from "react-router-dom";
import {
  SALE,
  DOCUMENT_TYPES,
  type SaleResource,
  type SaleInstallmentResource,
} from "../lib/sale.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import SaleDetailSheet from "./SaleDetailSheet";
import { findSaleById, declararSunat } from "../lib/sale.actions";
import TitleComponent from "@/components/TitleComponent";
import InstallmentPaymentManagementSheet from "@/pages/accounts-receivable/components/InstallmentPaymentManagementSheet";
import { successToast, errorToast } from "@/lib/core.function";
import PageWrapper from "@/components/PageWrapper";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useSidebar } from "@/components/ui/sidebar";

export default function SalePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openDelete, setOpenDelete] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [openDetailSheet, setOpenDetailSheet] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleResource | null>(null);
  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();

  const { data, isLoading, refetch } = useSale({
    search,
    page,
    per_page,
    from: startDate,
    to: endDate,
  });

  useEffect(() => {
    setPage(1);
  }, [page, per_page, search, startDate, endDate]);

  const { removeSale } = useSaleStore();

  const handleEdit = (sale: SaleResource) => {
    navigate(`/ventas/actualizar/${sale.id}`);
  };

  const handleDelete = (id: number) => {
    setSaleToDelete(id);
    setOpenDelete(true);
  };

  const handleViewDetails = async (sale: SaleResource) => {
    try {
      const response = await findSaleById(sale.id);
      setSelectedSale(response.data);
      setOpenDetailSheet(true);
    } catch (error) {
      console.error("Error al cargar detalles de la venta", error);
    }
  };

  useEffect(() => {
    setOpen(true);
    setOpenMobile(true);
  }, []);

  const handleManage = (sale: SaleResource) => {
    navigate(`/ventas/gestionar/${sale.id}`);
  };

  const handleQuickPay = (sale: SaleResource) => {
    // Validar que la suma de cuotas sea igual al total de la venta
    const totalAmount = sale.total_amount;
    const sumOfInstallments =
      sale.installments?.reduce((sum, inst) => sum + inst.amount, 0) || 0;

    if (Math.abs(totalAmount - sumOfInstallments) > 0.01) {
      errorToast(
        `No se puede realizar el pago rápido. La suma de las cuotas (${sumOfInstallments.toFixed(
          2,
        )}) no coincide con el total de la venta (${totalAmount.toFixed(
          2,
        )}). Por favor, sincronice las cuotas.`,
      );
      return;
    }

    // Tomar la primera cuota pendiente si existe
    const pendingInstallment = sale.installments?.find(
      (inst) => inst.pending_amount > 0,
    );

    if (pendingInstallment) {
      setSelectedInstallment(pendingInstallment);
      setOpenPaymentSheet(true);
    }
  };

  const handleDeclararSunat = async (sale: SaleResource) => {
    const documentType = DOCUMENT_TYPES.find(
      (dt) => dt.value === sale.document_type,
    );
    if (!documentType) {
      errorToast("Tipo de documento no reconocido para declarar a SUNAT");
      return;
    }
    try {
      const result = await declararSunat(sale.id, documentType.type);
      successToast(result.message || "Venta declarada a SUNAT correctamente");
      refetch();
    } catch {
      errorToast("Error al declarar la venta a SUNAT");
    }
  };

  const handlePaymentSuccess = () => {
    refetch();
    setOpenPaymentSheet(false);
    setSelectedInstallment(null);
  };

  const confirmDelete = async () => {
    if (saleToDelete) {
      try {
        await removeSale(saleToDelete);
        refetch();
        setOpenDelete(false);
        setSaleToDelete(null);
      } catch (error) {
        console.error("Error al eliminar venta", error);
      }
    }
  };

  const { MODEL, ICON } = SALE;

  const columns = getSaleColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    onManage: handleManage,
    onQuickPay: handleQuickPay,
    onDeclararSunat: handleDeclararSunat,
  });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todas las ventas registradas en el sistema"
          icon={ICON}
        />
        <SaleActions startDate={startDate} endDate={endDate} />
      </div>

      <SaleTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
      >
        <SaleOptions
          search={search}
          setSearch={setSearch}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </SaleTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      <SimpleDeleteDialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      <SaleDetailSheet
        sale={selectedSale}
        open={openDetailSheet}
        onClose={() => {
          setOpenDetailSheet(false);
          setSelectedSale(null);
        }}
      />

      <InstallmentPaymentManagementSheet
        open={openPaymentSheet}
        onClose={() => {
          setOpenPaymentSheet(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        onSuccess={handlePaymentSuccess}
      />
    </PageWrapper>
  );
}
