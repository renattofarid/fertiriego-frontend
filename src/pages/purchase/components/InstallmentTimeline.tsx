import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, Wallet, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";
import { parse } from "date-fns";
import { type PurchaseInstallmentResource } from "../lib/purchase.interface";
import { cn } from "@/lib/utils";

interface InstallmentTimelineProps {
  installments: PurchaseInstallmentResource[];
  currency: string;
  purchaseTotalAmount: string;
  onViewPayments: (installment: PurchaseInstallmentResource) => void;
  onSync: (installmentId: number, newAmount: number) => void;
  shouldShowSync: (installment: PurchaseInstallmentResource) => boolean;
}

const statusConfig = {
  PAGADO: {
    icon: CheckCircle2,
    dotClass: "bg-green-500 border-green-500",
    lineClass: "bg-green-200 dark:bg-green-900",
    badgeVariant: "default" as const,
    cardClass:
      "border-green-200 dark:border-green-800 bg-green-50/40 dark:bg-green-950/20",
    amountClass: "text-green-600 dark:text-green-400",
  },
  VENCIDO: {
    icon: AlertCircle,
    dotClass: "bg-red-500 border-red-500",
    lineClass: "bg-red-200 dark:bg-red-900",
    badgeVariant: "destructive" as const,
    cardClass:
      "border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20",
    amountClass: "text-red-600 dark:text-red-400",
  },
  PENDIENTE: {
    icon: Clock,
    dotClass: "bg-muted-foreground/40 border-muted-foreground/40",
    lineClass: "bg-muted",
    badgeVariant: "secondary" as const,
    cardClass: "border-border bg-card",
    amountClass: "text-orange-600 dark:text-orange-400",
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status as keyof typeof statusConfig] ?? statusConfig.PENDIENTE
  );
}

function formatCurrency(currency: string) {
  if (currency === "PEN") return "S/.";
  if (currency === "USD") return "$";
  return "€";
}

export function InstallmentTimeline({
  installments,
  currency,
  purchaseTotalAmount,
  onViewPayments,
  onSync,
  shouldShowSync,
}: InstallmentTimelineProps) {
  const symbol = formatCurrency(currency);

  if (!installments || installments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Circle className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hay cuotas registradas</p>
      </div>
    );
  }

  const paidCount = installments.filter((i) => i.status === "PAGADO").length;
  const progress = Math.round((paidCount / installments.length) * 100);

  return (
    <div className="space-y-4">
      {/* Barra de progreso general */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {paidCount} de {installments.length} cuotas pagadas
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-10">
        {installments.map((installment, index) => {
          const config = getStatusConfig(installment.status);
          const Icon = config.icon;
          const isLast = index === installments.length - 1;
          const paidAmount =
            parseFloat(installment.amount) -
            parseFloat(installment.pending_amount);

          return (
            <div key={installment.id} className="relative">
              {/* Línea vertical conectora */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[-26px] top-9 w-0.5 bottom-0",
                    config.lineClass,
                  )}
                />
              )}

              {/* Nodo del timeline */}
              <div
                className={cn(
                  "absolute left-[-34px] top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background",
                  config.dotClass,
                )}
              >
                <Icon className="h-3 w-3 text-white" />
              </div>

              {/* Tarjeta de cuota */}
              <div
                className={cn(
                  "mb-4 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md",
                  config.cardClass,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="font-semibold text-sm">
                        Cuota #{installment.installment_number}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {installment.correlativo}
                      </span>
                      <Badge variant={config.badgeVariant} className="text-xs">
                        {installment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Vencimiento
                        </p>
                        <p className="text-sm font-medium">
                          {parse(
                            installment.due_date,
                            "yyyy-MM-dd",
                            new Date(),
                          ).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {installment.due_days} días
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Monto</p>
                        <p className="text-sm font-bold">
                          {symbol} {parseFloat(installment.amount).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Pagado</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          {symbol} {paidAmount.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Saldo</p>
                        <p
                          className={cn(
                            "text-sm font-bold",
                            parseFloat(installment.pending_amount) === 0
                              ? "text-green-600 dark:text-green-400"
                              : config.amountClass,
                          )}
                        >
                          {symbol}{" "}
                          {parseFloat(installment.pending_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso de la cuota */}
                    {parseFloat(installment.amount) > 0 && (
                      <div className="mt-3">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              installment.status === "PAGADO"
                                ? "bg-green-500"
                                : installment.status === "VENCIDO"
                                  ? "bg-red-500"
                                  : "bg-primary",
                            )}
                            style={{
                              width: `${Math.min(100, (paidAmount / parseFloat(installment.amount)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {shouldShowSync(installment) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onSync(
                                  installment.id,
                                  parseFloat(purchaseTotalAmount),
                                )
                              }
                              className="text-xs"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Sincronizar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Sincronizar con total ({purchaseTotalAmount})
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPayments(installment)}
                      className="text-xs"
                    >
                      <Wallet className="h-3 w-3 mr-1" />
                      Ver Pagos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
