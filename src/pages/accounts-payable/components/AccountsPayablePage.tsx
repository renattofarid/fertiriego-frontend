"use client";

import { useState, useMemo, useEffect } from "react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import AccountsPayableOptions, {
  EMPTY_ACCOUNTS_PAYABLE_FILTERS,
  ACCOUNTS_PAYABLE_TEXT_FILTERS,
  type AccountsPayableFilters,
} from "./AccountsPayableOptions";
import { format } from "date-fns";
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
  const [filters, setFilters] = useState<AccountsPayableFilters>(
    EMPTY_ACCOUNTS_PAYABLE_FILTERS,
  );
  // Valores de los campos de texto con debounce (evita una petición por tecla)
  const [debouncedText, setDebouncedText] = useState<Record<string, string>>(
    {},
  );

  const [selectedInstallment, setSelectedInstallment] =
    useState<PurchaseInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const [openQuickViewSheet, setOpenQuickViewSheet] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      const next: Record<string, string> = {};
      ACCOUNTS_PAYABLE_TEXT_FILTERS.forEach((key) => {
        if (filters[key]) next[key] = filters[key];
      });
      setDebouncedText(next);
    }, 400);
    return () => clearTimeout(timer);
  }, [
    filters.installment_number,
    filters.due_days,
    filters.amount,
    filters.pending_amount,
  ]);

  // SearchInput llama onChange en cada render aunque el valor no cambie;
  // si no hay cambios reales no tocamos el estado para evitar un bucle de renders.
  const handleFiltersChange = (changes: Partial<AccountsPayableFilters>) => {
    setFilters((prev) => {
      const hasChanges = (Object.keys(changes) as (keyof AccountsPayableFilters)[]).some(
        (key) => changes[key] !== prev[key],
      );
      if (!hasChanges) return prev;
      setPage(1);
      return { ...prev, ...changes };
    });
  };

  // Filtros compartidos entre el listado y la exportación
  const filterParams = useMemo(() => {
    const params: Record<string, string> = { ...debouncedText };
    if (filters.purchase_id) params.purchase_id = filters.purchase_id;
    if (filters.status) params.status = filters.status;
    if (filters.due_date) params.due_date = format(filters.due_date, "yyyy-MM-dd");
    return params;
  }, [filters.purchase_id, filters.status, filters.due_date, debouncedText]);

  const params = { page, per_page, ...filterParams };

  const exportEndpoint = useMemo(() => {
    const query = new URLSearchParams(filterParams).toString();
    return query
      ? `purchase-installments/export?${query}`
      : "purchase-installments/export";
  }, [filterParams]);

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
          excelEndpoint={exportEndpoint}
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
        <AccountsPayableOptions
          filters={filters}
          onChange={handleFiltersChange}
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
