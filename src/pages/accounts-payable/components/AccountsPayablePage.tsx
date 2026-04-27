"use client";

import { useState, useMemo, useEffect } from "react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import AccountsPayableOptions from "./AccountsPayableOptions";
import { getAccountsPayableColumns } from "./AccountsPayableColumns";
import PageWrapper from "@/components/PageWrapper";
import ExportButtons from "@/components/ExportButtons";
import type { PurchaseInstallmentResource } from "../lib/accounts-payable.interface";
import DataTablePagination from "@/components/DataTablePagination";
import AccountsPayableSummary from "./AccountsPayableSummary";
import { InstallmentPaymentsSheet } from "@/pages/purchase/components/sheets/InstallmentPaymentsSheet";
import { useAccountsPayable, useAllAccountsPayable } from "../lib/accounts-payable.hook";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useQueryClient } from "@tanstack/react-query";
import { ACCOUNTS_PAYABLE_QUERY_KEY } from "../lib/accounts-payable.interface";

export default function AccountsPayablePage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedInstallment, setSelectedInstallment] =
    useState<PurchaseInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const [openQuickViewSheet, setOpenQuickViewSheet] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = { page, per_page, search: debouncedSearch || undefined };

  const { data, isLoading } = useAccountsPayable(params);
  const { data: allInstallments } = useAllAccountsPayable();

  const installments = data?.data ?? [];
  const meta = data?.meta;

  const handleOpenPayment = (installment: PurchaseInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentSheet(true);
  };

  const handleOpenQuickView = (installment: PurchaseInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenQuickViewSheet(true);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [ACCOUNTS_PAYABLE_QUERY_KEY] });
    setOpenPaymentSheet(false);
    setSelectedInstallment(null);
  };

  const handleClosePaymentSheet = () => {
    queryClient.invalidateQueries({ queryKey: [ACCOUNTS_PAYABLE_QUERY_KEY] });
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
      >
        <ExportButtons
          excelEndpoint="purchase-installments/export"
          excelFileName="cuentas_por_pagar.xlsx"
        />
      </TitleComponent>

      {/* Summary */}
      <AccountsPayableSummary installments={allInstallments ?? []} />

      {/* Table */}
      <DataTable
        columns={columns}
        data={installments}
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
