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
import { ACCOUNTS_RECEIVABLE_QUERY_KEY, ACCOUNTS_RECEIVABLE_ENDPOINT } from "../lib/accounts-receivable.interface";
import { api } from "@/lib/config";

export default function AccountsReceivablePage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderPurchase, setOrderPurchase] = useState("");
  const [orderService, setOrderService] = useState("");
  const [dateExpired, setDateExpired] = useState("");
  const [statusFacturado, setStatusFacturado] = useState("");
  const [customerNames, setCustomerNames] = useState("");
  const [customerFatherSurname, setCustomerFatherSurname] = useState("");
  const [customerMotherSurname, setCustomerMotherSurname] = useState("");

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
    "sale$customer_id": customerId || undefined,
    "sale$warehouse_id": warehouseId || undefined,
    "sale$user_id": userId || undefined,
    "sale$order_id": orderId || undefined,
    "sale$quotation_id": quotationId || undefined,
    "sale$document_type": documentType || undefined,
    "sale$serie": serie || undefined,
    "sale$numero": numero || undefined,
    "sale$issue_date": issueDate || undefined,
    "sale$payment_type": paymentType || undefined,
    "sale$status": status || undefined,
    "sale$currency": currency || undefined,
    "sale$created_at": startDate && endDate ? `${startDate},${endDate}` : undefined,
    "sale$order_purchase": orderPurchase || undefined,
    "sale$order_service": orderService || undefined,
    "sale$date_expired": dateExpired || undefined,
    "sale$status_facturado": statusFacturado || undefined,
    "sale$customer$names": customerNames || undefined,
    "sale$customer$father_surname": customerFatherSurname || undefined,
    "sale$customer$mother_surname": customerMotherSurname || undefined,
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

  const handleExcelDownload = async () => {
    const { page: _page, per_page: _per_page, ...exportFilters } = params;
    const response = await api.get(`${ACCOUNTS_RECEIVABLE_ENDPOINT}/export`, {
      responseType: "blob",
      params: exportFilters,
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
          search={search}
          setSearch={setSearch}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          customerId={customerId}
          setCustomerId={setCustomerId}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          userId={userId}
          setUserId={setUserId}
          orderId={orderId}
          setOrderId={setOrderId}
          quotationId={quotationId}
          setQuotationId={setQuotationId}
          documentType={documentType}
          setDocumentType={setDocumentType}
          serie={serie}
          setSerie={setSerie}
          numero={numero}
          setNumero={setNumero}
          issueDate={issueDate}
          setIssueDate={setIssueDate}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          status={status}
          setStatus={setStatus}
          currency={currency}
          setCurrency={setCurrency}
          orderPurchase={orderPurchase}
          setOrderPurchase={setOrderPurchase}
          orderService={orderService}
          setOrderService={setOrderService}
          dateExpired={dateExpired}
          setDateExpired={setDateExpired}
          statusFacturado={statusFacturado}
          setStatusFacturado={setStatusFacturado}
          customerNames={customerNames}
          setCustomerNames={setCustomerNames}
          customerFatherSurname={customerFatherSurname}
          setCustomerFatherSurname={setCustomerFatherSurname}
          customerMotherSurname={customerMotherSurname}
          setCustomerMotherSurname={setCustomerMotherSurname}
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
