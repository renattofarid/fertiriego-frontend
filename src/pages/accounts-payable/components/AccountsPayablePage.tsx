"use client";

import { useEffect, useState, useMemo } from "react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import AccountsPayableOptions from "./AccountsPayableOptions";
import { getAccountsPayableColumns } from "./AccountsPayableColumns";
import PageWrapper from "@/components/PageWrapper";
import type { PurchaseInstallmentResource } from "../lib/accounts-payable.interface";
import DataTablePagination from "@/components/DataTablePagination";
import { useAccountsPayableStore } from "../lib/accounts-payable.store";
import AccountsPayableSummary from "./AccountsPayableSummary";
import { InstallmentPaymentsSheet } from "@/pages/purchase/components/sheets/InstallmentPaymentsSheet";

export default function AccountsPayablePage() {
  const {
    installments,
    allInstallments,
    meta,
    isLoading,
    page,
    per_page,
    search,
    setPage,
    setPerPage,
    setSearch,
    fetchInstallments,
    fetchAllInstallments,
  } = useAccountsPayableStore();

  const [filteredInstallments, setFilteredInstallments] = useState<
    PurchaseInstallmentResource[]
  >([]);
  const [selectedInstallment, setSelectedInstallment] =
    useState<PurchaseInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const [openQuickViewSheet, setOpenQuickViewSheet] = useState(false);

  useEffect(() => {
    fetchInstallments();
    fetchAllInstallments();
  }, []);

  useEffect(() => {
    filterInstallments();
  }, [search, installments]);

  const filterInstallments = () => {
    if (!search.trim()) {
      setFilteredInstallments(installments);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = installments.filter(
      (inst) =>
        inst.correlativo.toLowerCase().includes(searchLower) ||
        inst.purchase_correlativo.toLowerCase().includes(searchLower) ||
        inst.installment_number.toString().includes(searchLower)
    );
    setFilteredInstallments(filtered);
  };

  const handleOpenPayment = (installment: PurchaseInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentSheet(true);
  };

  const handleOpenQuickView = (installment: PurchaseInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenQuickViewSheet(true);
  };

  const handlePaymentSuccess = () => {
    fetchInstallments();
    fetchAllInstallments();
    setOpenPaymentSheet(false);
    setSelectedInstallment(null);
  };

  const handleClosePaymentSheet = () => {
    fetchInstallments();
    fetchAllInstallments();
    setOpenPaymentSheet(false);
    setSelectedInstallment(null);
  };

  const columns = useMemo(
    () => getAccountsPayableColumns(handleOpenPayment, handleOpenQuickView),
    []
  );

  return (
    <PageWrapper>
      {/* Header */}
      <TitleComponent
        title="Cuentas por Pagar"
        subtitle="Gestión y seguimiento de cuotas pendientes a proveedores"
        icon="DollarSign"
      />

      {/* Summary - Minimalista */}
      <AccountsPayableSummary installments={allInstallments} />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredInstallments}
        isLoading={isLoading}
      >
        <AccountsPayableOptions search={search} setSearch={setSearch} />
      </DataTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {/* Quick View Sheet */}
      <InstallmentPaymentsSheet
        open={openQuickViewSheet}
        onClose={() => {
          setOpenQuickViewSheet(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
      />

      {/* Payment Management Sheet */}
      <InstallmentPaymentsSheet
        open={openPaymentSheet}
        onClose={handleClosePaymentSheet}
        installment={selectedInstallment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </PageWrapper>
  );
}
