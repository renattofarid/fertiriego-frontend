"use client";

import { useEffect, useState, useMemo } from "react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import InstallmentPaymentManagementSheet from "./InstallmentPaymentManagementSheet";
import InstallmentPaymentsSheet from "@/pages/sale/components/InstallmentPaymentsSheet";
import AccountsReceivableOptions from "./AccountsReceivableOptions";
import { getAccountsReceivableColumns } from "./AccountsReceivableColumns";
import PageWrapper from "@/components/PageWrapper";
import type { SaleInstallmentResource } from "../lib/accounts-receivable.interface";
import DataTablePagination from "@/components/DataTablePagination";
import { useAccountsReceivableStore } from "../lib/accounts-receivable.store";
import AccountsReceivableSummary from "./AccountsReceivableSummary";

export default function AccountsReceivablePage() {
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
  } = useAccountsReceivableStore();

  const [filteredInstallments, setFilteredInstallments] = useState<
    SaleInstallmentResource[]
  >([]);
  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
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
    const filtered = installments.filter((inst) =>
      inst.installment_number.toString().includes(searchLower)
    );
    setFilteredInstallments(filtered);
  };

  const handleOpenPayment = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentSheet(true);
  };

  const handleOpenQuickView = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenQuickViewSheet(true);
  };

  const handlePaymentSuccess = () => {
    fetchInstallments();
    fetchAllInstallments();
    setOpenPaymentSheet(false);
    setSelectedInstallment(null);
  };

  const columns = useMemo(
    () => getAccountsReceivableColumns(handleOpenPayment, handleOpenQuickView),
    []
  );

  return (
    <PageWrapper>
      {/* Header */}
      <TitleComponent
        title="Cuentas por Cobrar"
        subtitle="Gestión y seguimiento de cuotas pendientes"
        icon="DollarSign"
      />

      {/* Summary - Minimalista */}
      <AccountsReceivableSummary installments={allInstallments} />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredInstallments}
        isLoading={isLoading}
      >
        <AccountsReceivableOptions search={search} setSearch={setSearch} />
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
        currency="S/."
      />

      {/* Payment Management Sheet */}
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
