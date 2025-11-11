"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  AlertTriangle,
  Clock,
  Receipt,
} from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import FormWrapper from "@/components/FormWrapper";
import { DataTable } from "@/components/DataTable";
import { getAllInstallments } from "../lib/accounts-receivable.actions";
import type { SaleInstallmentResource } from "@/pages/sale/lib/sale.interface";
import InstallmentPaymentManagementSheet from "./InstallmentPaymentManagementSheet";
import AccountsReceivableOptions from "./AccountsReceivableOptions";
import { getAccountsReceivableColumns } from "./AccountsReceivableColumns";

export default function AccountsReceivablePage() {
  const [installments, setInstallments] = useState<SaleInstallmentResource[]>(
    []
  );
  const [filteredInstallments, setFilteredInstallments] = useState<
    SaleInstallmentResource[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);

  useEffect(() => {
    fetchInstallments();
  }, []);

  useEffect(() => {
    filterInstallments();
  }, [search, installments]);

  const fetchInstallments = async () => {
    setIsLoading(true);
    try {
      const data = await getAllInstallments();
      setInstallments(data);
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
    const filtered = installments.filter(
      (inst) =>
        inst.sale_correlativo.toLowerCase().includes(searchLower) ||
        inst.correlativo.toLowerCase().includes(searchLower) ||
        inst.installment_number.toString().includes(searchLower)
    );
    setFilteredInstallments(filtered);
  };

  // Calcular resumen
  const calculateSummary = () => {
    const today = new Date();
    const soonDate = new Date();
    soonDate.setDate(today.getDate() + 7); // Próximos 7 días

    let totalPending = 0;
    let totalOverdue = 0;
    let totalToExpireSoon = 0;
    let totalInstallments = 0;

    installments.forEach((inst) => {
      const pendingAmount = parseFloat(inst.pending_amount);
      const dueDate = new Date(inst.due_date);

      if (pendingAmount > 0) {
        totalPending += pendingAmount;
        totalInstallments++;

        if (dueDate < today && inst.status === "VENCIDO") {
          totalOverdue += pendingAmount;
        } else if (dueDate <= soonDate && dueDate >= today) {
          totalToExpireSoon += pendingAmount;
        }
      }
    });

    return {
      totalPending,
      totalOverdue,
      totalToExpireSoon,
      totalInstallments,
    };
  };

  const summary = calculateSummary();

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toFixed(2)}`;
  };

  const handleOpenPayment = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentSheet(true);
  };

  const handlePaymentSuccess = () => {
    fetchInstallments();
    setOpenPaymentSheet(false);
    setSelectedInstallment(null);
  };

  const columns = useMemo(
    () => getAccountsReceivableColumns(handleOpenPayment),
    [handleOpenPayment]
  );

  return (
    <FormWrapper>
      {/* Header */}
      <TitleComponent
        title="Cuentas por Cobrar"
        subtitle="Gestión y seguimiento de cuotas pendientes"
        icon="DollarSign"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Pendiente */}
        <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Total Pendiente
                </p>
                <p className="text-2xl font-bold text-muted-foreground truncate">
                  {formatCurrency(summary.totalPending)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.totalInstallments} cuota(s)
                </p>
              </div>
              <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vencidas */}
        <Card className="border-none bg-destructive/5 hover:bg-destructive/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Vencidas
                </p>
                <p className="text-2xl font-bold text-destructive truncate">
                  {formatCurrency(summary.totalOverdue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requieren atención
                </p>
              </div>
              <div className="bg-destructive/10 p-2.5 rounded-lg shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Por Vencer */}
        <Card className="border-none bg-orange-500/5 hover:bg-orange-500/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Por Vencer (7 días)
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-500 truncate">
                  {formatCurrency(summary.totalToExpireSoon)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Próximos vencimientos
                </p>
              </div>
              <div className="bg-orange-500/10 p-2.5 rounded-lg shrink-0">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Cuotas */}
        <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Total Cuotas
                </p>
                <p className="text-2xl font-bold text-primary truncate">
                  {installments.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registradas en sistema
                </p>
              </div>
              <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredInstallments} isLoading={isLoading}>
        <AccountsReceivableOptions search={search} setSearch={setSearch} />
      </DataTable>

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
    </FormWrapper>
  );
}
