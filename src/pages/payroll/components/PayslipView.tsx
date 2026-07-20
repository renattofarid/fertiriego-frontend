import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import type { PayslipResource } from "../lib/payroll.interface";

const STATUS_LABEL: Record<string, string> = {
  CALCULADO: "Calculado",
  ENVIADO: "Enviado",
};

function money(value: string | number) {
  return formatCurrency(Number(value), { currencySymbol: "S/" });
}

interface PayslipViewProps {
  payslip: PayslipResource;
  periodLabel?: string;
  className?: string;
}

export default function PayslipView({
  payslip,
  periodLabel,
  className,
}: PayslipViewProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md rounded-2xl border bg-card shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 text-center border-b border-dashed">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Boleta de Pago{periodLabel ? ` · ${periodLabel}` : ""}
        </p>
        <p className="mt-1 font-semibold">{payslip.person_name}</p>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Neto a Pagar</p>
          <p className="text-4xl font-bold tracking-tight">
            {money(payslip.net_salary)}
          </p>
        </div>
        <div className="mt-3 flex justify-center">
          <Badge
            variant={payslip.status === "ENVIADO" ? "default" : "secondary"}
          >
            {STATUS_LABEL[payslip.status] ?? payslip.status}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Ingresos
          </p>
          <div className="space-y-1.5">
            {payslip.income_lines.map((line, index) => (
              <div
                key={`${line.concept}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {line.concept}
                  {line.is_taxable === false && (
                    <span className="ml-1 text-[10px] uppercase text-muted-foreground/70">
                      (no afecto)
                    </span>
                  )}
                </span>
                <span className="font-medium">{money(line.amount)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total Ingresos</span>
            <span>{money(payslip.gross_salary)}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Descuentos
          </p>
          <div className="space-y-1.5">
            {payslip.deduction_lines.map((line, index) => (
              <div
                key={`${line.concept}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{line.concept}</span>
                <span className="font-medium text-red-600">
                  -{money(line.amount)}
                </span>
              </div>
            ))}
            {payslip.deduction_lines.length === 0 && (
              <p className="text-xs text-muted-foreground">Sin descuentos</p>
            )}
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total Descuentos</span>
            <span className="text-red-600">
              -{money(payslip.total_deductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/40 border-t border-dashed space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Sistema de Pensión</span>
          <span>{payslip.pension_system?.name ?? "Sin asignar"}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Boleta N°</span>
          <span>#{payslip.id}</span>
        </div>
        {payslip.sent_at && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Enviada</span>
            <span>{new Date(payslip.sent_at).toLocaleString("es-PE")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
