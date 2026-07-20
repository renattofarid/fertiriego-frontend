import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  useWorkerIncomesReport,
  useWorkerExpensesReport,
  useWorkerPayslipsReport,
} from "../lib/payroll-report.hook";
import type {
  PayslipsReportItem,
} from "../lib/payroll-report.interface";

function money(value: string | number) {
  return formatCurrency(Number(value), { currencySymbol: "S/" });
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

const payslipColumns: ColumnDef<PayslipsReportItem>[] = [
  { accessorKey: "period", header: "Periodo" },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => (
      <Badge variant={getValue() === "ENVIADO" ? "default" : "secondary"}>
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "gross_salary",
    header: "Bruto",
    cell: ({ getValue }) => money(getValue() as string),
  },
  {
    accessorKey: "total_deductions",
    header: "Descuentos",
    cell: ({ getValue }) => (
      <span className="text-red-600">-{money(getValue() as string)}</span>
    ),
  },
  {
    accessorKey: "net_salary",
    header: "Neto",
    cell: ({ getValue }) => (
      <span className="font-semibold text-green-600">
        {money(getValue() as string)}
      </span>
    ),
  },
  {
    accessorKey: "sent_at",
    header: "Enviada",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? new Date(value).toLocaleDateString("es-PE") : "-";
    },
  },
];

export default function WorkerPayrollReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const personId = Number(id);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: incomesData, isLoading: loadingIncomes } =
    useWorkerIncomesReport(personId, year);
  const { data: expensesData, isLoading: loadingExpenses } =
    useWorkerExpensesReport(personId, year);
  const { data: payslipsData, isLoading: loadingPayslips } =
    useWorkerPayslipsReport(personId, year);

  const workerName =
    incomesData?.data.worker.full_name ??
    expensesData?.data.worker.full_name ??
    payslipsData?.data.worker.full_name ??
    "Reporte de Planilla";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <TitleComponent
            title={workerName}
            subtitle="Reporte de ingresos, descuentos y boletas del trabajador"
            icon="FileSpreadsheet"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Año</Label>
          <Input
            type="number"
            className="w-28"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      <Tabs defaultValue="incomes">
        <TabsList>
          <TabsTrigger value="incomes">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="payslips">Boletas</TabsTrigger>
        </TabsList>

        <TabsContent value="incomes" className="space-y-4">
          {incomesData && (
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Total Bruto Anual"
                value={money(incomesData.data.totals.gross_salary)}
              />
              <StatTile
                label="Otros Ingresos Anual"
                value={money(incomesData.data.totals.other_incomes)}
              />
            </div>
          )}

          {loadingIncomes && (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          )}

          {incomesData?.data.months.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay ingresos registrados para el año {year}.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomesData?.data.months.map((month) => (
              <Card key={month.period}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{month.period}</p>
                    <span className="font-bold text-green-600">
                      {money(month.gross_salary)}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    {month.lines.map((line, index) => (
                      <div
                        key={`${line.concept}-${index}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {line.concept}
                        </span>
                        <span>{money(line.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {expensesData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile
                label="Pensión Anual"
                value={money(expensesData.data.totals.pension_deduction)}
              />
              <StatTile
                label="Renta Anual"
                value={money(expensesData.data.totals.income_tax)}
              />
              <StatTile
                label="Otros Descuentos"
                value={money(expensesData.data.totals.other_deductions)}
              />
              <StatTile
                label="Neto Anual"
                value={money(expensesData.data.totals.net_salary)}
              />
            </div>
          )}

          {loadingExpenses && (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          )}

          {expensesData?.data.months.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay descuentos registrados para el año {year}.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expensesData?.data.months.map((month) => (
              <Card key={month.period}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{month.period}</p>
                    <span className="font-bold text-green-600">
                      {money(month.net_salary)}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    {month.lines.map((line, index) => (
                      <div
                        key={`${line.concept}-${index}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {line.concept}
                        </span>
                        <span className="text-red-600">
                          -{money(line.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payslips" className="space-y-4">
          {payslipsData && (
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Neto Anual"
                value={money(payslipsData.data.annual_net)}
              />
              <StatTile
                label="Boletas Emitidas"
                value={String(payslipsData.data.payslips.length)}
              />
            </div>
          )}
          <DataTable
            columns={payslipColumns}
            data={payslipsData?.data.payslips || []}
            isLoading={loadingPayslips}
            initialColumnVisibility={{}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
