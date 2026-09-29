"use client";

import { useState, useMemo, useEffect } from "react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import InstallmentPaymentManagementSheet from "./InstallmentPaymentManagementSheet";
import InstallmentPaymentsSheet from "@/pages/sale/components/InstallmentPaymentsSheet";
import AccountsReceivableOptions, {
  EMPTY_ACCOUNTS_RECEIVABLE_FILTERS,
  type AccountsReceivableFilters,
} from "./AccountsReceivableOptions";
import { format } from "date-fns";
import { getAccountsReceivableColumns } from "./AccountsReceivableColumns";
import PageWrapper from "@/components/PageWrapper";
import ExportButtons from "@/components/ExportButtons";
import type { SaleInstallmentResource } from "../lib/accounts-receivable.interface";
import DataTablePagination from "@/components/DataTablePagination";
import AccountsReceivableSummary from "./AccountsReceivableSummary";
import { useAccountsReceivable, useAllAccountsReceivable } from "../lib/accounts-receivable.hook";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useQueryClient } from "@tanstack/react-query";
import { ACCOUNTS_RECEIVABLE_QUERY_KEY, ACCOUNTS_RECEIVABLE_ENDPOINT } from "../lib/accounts-receivable.interface";
import { api } from "@/lib/config";

export default function AccountsReceivablePage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [filters, setFilters] = useState<AccountsReceivableFilters>(
    EMPTY_ACCOUNTS_RECEIVABLE_FILTERS,
  );
  // Campos de texto con debounce (evita una petición por tecla)
  const [debouncedText, setDebouncedText] = useState({
    search: "",
    installment_number: "",
  });

  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const [openQuickViewSheet, setOpenQuickViewSheet] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText({
        search: filters.search,
        installment_number: filters.installment_number,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search, filters.installment_number]);

  // SearchInput llama onChange en cada render aunque el valor no cambie;
  // si no hay cambios reales no tocamos el estado para evitar un bucle de renders.
  const handleFiltersChange = (changes: Partial<AccountsReceivableFilters>) => {
    setFilters((prev) => {
      const hasChanges = (
        Object.keys(changes) as (keyof AccountsReceivableFilters)[]
      ).some((key) => changes[key] !== prev[key]);
      if (!hasChanges) return prev;
      setPage(1);
      return { ...prev, ...changes };
    });
  };

  // Solo los filtros que soporta GET /installments
  const filterParams = useMemo(
    () => ({
      search: debouncedText.search || undefined,
      status: filters.status || undefined,
      sale_id: filters.sale_id ? Number(filters.sale_id) : undefined,
      installment_number: debouncedText.installment_number
        ? Number(debouncedText.installment_number)
        : undefined,
      due_date: filters.due_date
        ? format(filters.due_date, "yyyy-MM-dd")
        : undefined,
    }),
    [filters.status, filters.sale_id, filters.due_date, debouncedText],
  );

  const params = { page, per_page, ...filterParams };

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

  const handleExcelDownload = async () => {
    const response = await api.get(`${ACCOUNTS_RECEIVABLE_ENDPOINT}/export`, {
      responseType: "blob",
      params: filterParams,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cuentas_por_cobrar.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
          onExcelDownload={handleExcelDownload}
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
