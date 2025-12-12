"use client";

import { useEffect, useState, useMemo } from "react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import {
  getAllInstallments,
  getInstallments,
} from "../lib/accounts-receivable.actions";
import InstallmentPaymentManagementSheet from "./InstallmentPaymentManagementSheet";
import InstallmentPaymentsSheet from "@/pages/sale/components/InstallmentPaymentsSheet";
import AccountsReceivableOptions from "./AccountsReceivableOptions";
import { getAccountsReceivableColumns } from "./AccountsReceivableColumns";
import PageWrapper from "@/components/PageWrapper";
import type { SaleInstallmentResource } from "../lib/accounts-receivable.interface";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { Meta } from "@/lib/pagination.interface";

export default function AccountsReceivablePage() {
  const [installments, setInstallments] = useState<SaleInstallmentResource[]>(
    []
  );
  const [meta, setMeta] = useState<Meta>();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [filteredInstallments, setFilteredInstallments] = useState<
    SaleInstallmentResource[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const [openQuickViewSheet, setOpenQuickViewSheet] = useState(false);

  useEffect(() => {
    fetchInstallments();
  }, []);

  useEffect(() => {
    filterInstallments();
  }, [search, installments]);

  const fetchInstallments = async () => {
    setIsLoading(true);
    try {
      const { data, meta } = await getInstallments({
        page,
        per_page,
      });
      setInstallments(data);
      setMeta(meta);
    } catch (error) {
      console.error("Error fetching installments:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Calcular resumen agrupado por moneda
  const calculateSummary = () => {
    const today = new Date();
    const soonDate = new Date();
    soonDate.setDate(today.getDate() + 7); // Próximos 7 días

    // Objeto para agrupar por moneda
    const summaryByCurrency: Record<
      string,
      {
        totalPending: number;
        totalOverdue: number;
        totalToExpireSoon: number;
        totalInstallments: number;
      }
    > = {};

    installments.forEach((inst) => {
      const pendingAmount = inst.pending_amount;
      const dueDate = new Date(inst.due_date);
      const currency = inst.currency || "S/";

      // Inicializar moneda si no existe
      if (!summaryByCurrency[currency]) {
        summaryByCurrency[currency] = {
          totalPending: 0,
          totalOverdue: 0,
          totalToExpireSoon: 0,
          totalInstallments: 0,
        };
      }

      if (pendingAmount > 0) {
        summaryByCurrency[currency].totalPending += pendingAmount;
        summaryByCurrency[currency].totalInstallments++;

        if (dueDate < today && inst.status === "VENCIDO") {
          summaryByCurrency[currency].totalOverdue += pendingAmount;
        } else if (dueDate <= soonDate && dueDate >= today) {
          summaryByCurrency[currency].totalToExpireSoon += pendingAmount;
        }
      }
    });

    return summaryByCurrency;
  };

  const summaryByCurrency = calculateSummary();

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
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
      {Object.keys(summaryByCurrency).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(summaryByCurrency).map(([currency, summary]) => (
            <div
              key={currency}
              className="grid grid-cols-2 md:grid-cols-5 gap-2"
            >
              {/* Moneda */}
              <div className="p-2 bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="font-bold text-lg">{currency}</p>
              </div>

              {/* Total Pendiente */}
              <div className="p-2 bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Pendiente
                </p>
                <p className="text-sm font-bold text-muted-foreground truncate">
                  {formatCurrency(summary.totalPending, currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.totalInstallments} cuota(s)
                </p>
              </div>

              {/* Vencidas */}
              <div className="p-2 bg-destructive/5 hover:bg-destructive/10 transition-colors rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Vencidas</p>
                <p className="text-sm font-bold text-destructive truncate">
                  {formatCurrency(summary.totalOverdue, currency)}
                </p>
              </div>

              {/* Por Vencer */}
              <div className="p-2 bg-orange-500/5 hover:bg-orange-500/10 transition-colors rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Por Vencer
                </p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-500 truncate">
                  {formatCurrency(summary.totalToExpireSoon, currency)}
                </p>
              </div>

              {/* Total Cuotas */}
              <div className="p-2 bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Cuotas</p>
                <p className="text-sm font-bold text-primary truncate">
                  {summary.totalInstallments}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No hay cuotas pendientes registradas
        </div>
      )}

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
