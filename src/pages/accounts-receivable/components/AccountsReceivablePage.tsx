"use client";

import { useState, useMemo, useEffect } from "react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import InstallmentPaymentManagementSheet from "./InstallmentPaymentManagementSheet";
import InstallmentPaymentsSheet from "@/pages/sale/components/InstallmentPaymentsSheet";
import AccountsReceivableOptions from "./AccountsReceivableOptions";
import { getAccountsReceivableColumns } from "./AccountsReceivableColumns";
import PageWrapper from "@/components/PageWrapper";
import ExportButtons from "@/components/ExportButtons";
import type { SaleInstallmentResource } from "../lib/accounts-receivable.interface";
import DataTablePagination from "@/components/DataTablePagination";
import AccountsReceivableSummary from "./AccountsReceivableSummary";
import { useAccountsReceivable, useAllAccountsReceivable } from "../lib/accounts-receivable.hook";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useQueryClient } from "@tanstack/react-query";
import { ACCOUNTS_RECEIVABLE_QUERY_KEY } from "../lib/accounts-receivable.interface";

export default function AccountsReceivablePage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currency, setCurrency] = useState("all");

  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
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

  const params = {
    page,
    per_page,
    search: debouncedSearch || undefined,
    currency: currency !== "all" ? currency : undefined,
  };

  const { data, isLoading } = useAccountsReceivable(params);
  const { data: allInstallments } = useAllAccountsReceivable();

  const installments = data?.data ?? [];
  const meta = data?.meta;

  const handleOpenPayment = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentSheet(true);
  };

  const handleOpenQuickView = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenQuickViewSheet(true);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [ACCOUNTS_RECEIVABLE_QUERY_KEY] });
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
      >
        <ExportButtons
          excelEndpoint="installments/export"
          excelFileName="cuentas_por_cobrar.xlsx"
        />
      </TitleComponent>

      {/* Summary */}
      <AccountsReceivableSummary installments={allInstallments ?? []} />

      {/* Table */}
      <DataTable
        columns={columns}
        data={installments}
        isLoading={isLoading}
      >
        <AccountsReceivableOptions
          search={search}
          setSearch={setSearch}
          currency={currency}
          setCurrency={setCurrency}
        />
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
