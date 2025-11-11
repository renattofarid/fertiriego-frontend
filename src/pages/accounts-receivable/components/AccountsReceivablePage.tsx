"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  AlertTriangle,
  Clock,
  FileText,
  Wallet,
  Search,
} from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { getAllInstallments } from "../lib/accounts-receivable.actions";
import type { SaleInstallmentResource } from "@/pages/sale/lib/sale.interface";
import InstallmentPaymentManagementSheet from "./InstallmentPaymentManagementSheet";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const getStatusBadge = (installment: SaleInstallmentResource) => {
    const pendingAmount = parseFloat(installment.pending_amount);

    if (pendingAmount === 0 || installment.status === "PAGADO") {
      return (
        <Badge variant="default" className="bg-green-600">
          PAGADO
        </Badge>
      );
    }

    if (installment.status === "VENCIDO") {
      return <Badge variant="destructive">VENCIDO</Badge>;
    }

    return <Badge variant="secondary">PENDIENTE</Badge>;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <TitleComponent
        title="Cuentas por Cobrar"
        subtitle="Gestión y seguimiento de cuotas pendientes"
        icon="DollarSign"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Pendiente
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalPending)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.totalInstallments} cuota(s)
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Vencidas
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(summary.totalOverdue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requieren atención
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Por Vencer (7 días)
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(summary.totalToExpireSoon)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Próximos vencimientos
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Cuotas
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {installments.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registradas en sistema
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por correlativo de venta, cuota o número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando cuotas...</p>
            </div>
          ) : filteredInstallments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search.trim()
                  ? "No se encontraron cuotas con ese criterio"
                  : "No hay cuotas registradas"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venta</TableHead>
                    <TableHead>Cuota</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Pendiente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstallments.map((installment) => {
                    const isPending =
                      parseFloat(installment.pending_amount) > 0;
                    const isOverdue =
                      isPending &&
                      new Date(installment.due_date) < new Date() &&
                      installment.status === "VENCIDO";

                    return (
                      <TableRow
                        key={installment.id}
                        className={isOverdue ? "bg-red-50 dark:bg-red-950/20" : ""}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {installment.sale_correlativo}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {installment.correlativo}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            Cuota {installment.installment_number}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(installment.due_date)}</span>
                            <span className="text-xs text-muted-foreground">
                              {installment.due_days} días
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(parseFloat(installment.amount))}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              isPending ? "text-orange-600" : "text-green-600"
                            }`}
                          >
                            {formatCurrency(
                              parseFloat(installment.pending_amount)
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(installment)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPayment(installment)}
                          >
                            <Wallet className="h-4 w-4 mr-2" />
                            {isPending ? "Pagar" : "Ver Pagos"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
