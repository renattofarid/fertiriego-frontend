"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, AlertTriangle, Clock, Receipt } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import { getAllInstallments } from "../lib/accounts-receivable.actions";
import type { SaleInstallmentResource } from "@/pages/sale/lib/sale.interface";
import InstallmentPaymentManagementSheet from "./InstallmentPaymentManagementSheet";
import InstallmentPaymentsSheet from "@/pages/sale/components/InstallmentPaymentsSheet";
import AccountsReceivableOptions from "./AccountsReceivableOptions";
import { getAccountsReceivableColumns } from "./AccountsReceivableColumns";
import PageWrapper from "@/components/PageWrapper";

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
      const pendingAmount = parseFloat(inst.pending_amount);
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

      {/* Summary Cards - Agrupado por Moneda */}
      <div className="space-y-3">
        {Object.entries(summaryByCurrency).map(([currency, summary]) => (
          <Card key={currency} className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  Resumen en {currency}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Pendiente */}
                <div className="p-3 bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-1">
                        Total Pendiente
                      </p>
                      <p className="text-xl font-bold text-muted-foreground truncate">
                        {formatCurrency(summary.totalPending, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {summary.totalInstallments} cuota(s)
                      </p>
                    </div>
                    <div className="bg-muted-foreground/10 p-2 rounded-lg shrink-0">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Vencidas */}
                <div className="p-3 bg-destructive/5 hover:bg-destructive/10 transition-colors rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-1">
                        Vencidas
                      </p>
                      <p className="text-xl font-bold text-destructive truncate">
                        {formatCurrency(summary.totalOverdue, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requieren atención
                      </p>
                    </div>
                    <div className="bg-destructive/10 p-2 rounded-lg shrink-0">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                  </div>
                </div>

                {/* Por Vencer */}
                <div className="p-3 bg-orange-500/5 hover:bg-orange-500/10 transition-colors rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-1">
                        Por Vencer (7 días)
                      </p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-500 truncate">
                        {formatCurrency(summary.totalToExpireSoon, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Próximos vencimientos
                      </p>
                    </div>
                    <div className="bg-orange-500/10 p-2 rounded-lg shrink-0">
                      <Clock className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Total Cuotas por moneda */}
                <div className="p-3 bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-1">
                        Total Cuotas
                      </p>
                      <p className="text-xl font-bold text-primary truncate">
                        {summary.totalInstallments}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        En {currency}
                      </p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                      <Receipt className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Mensaje si no hay cuotas */}
        {Object.keys(summaryByCurrency).length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No hay cuotas pendientes registradas
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredInstallments}
        isLoading={isLoading}
      >
        <AccountsReceivableOptions search={search} setSearch={setSearch} />
      </DataTable>

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
