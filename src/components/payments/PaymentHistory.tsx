"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Banknote,
  CreditCard,
  Landmark,
  Pencil,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { cn, parseLocalDate } from "@/lib/utils";

/**
 * Historial de pagos de una cuota (compras y ventas).
 *
 * Se cuenta como una línea de tiempo: la cuota se emite por un monto y cada
 * pago lo va reduciendo. Cada pago muestra cuánto era el saldo después de
 * registrarlo, así el usuario entiende el recorrido sin sumar de cabeza.
 */

export interface PaymentHistoryItem {
  id: number;
  /** Correlativo del pago, si lo tiene (PY-00000707) */
  code?: string | null;
  /** yyyy-MM-dd */
  date: string;
  reference?: string | null;
  bank?: string | null;
  observation?: string | null;
  registeredBy?: string | null;
  total: number;
  /** Solo los métodos con monto > 0 */
  methods: { label: string; amount: number }[];
}

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
  /** Monto original de la cuota */
  installmentAmount: number;
  /** Texto que antecede a los montos (S/., $, PEN...) */
  currency?: string;
  isLoading?: boolean;
  onEdit?: (id: number) => void;
  /** Debe lanzar si falla; el diálogo se cierra al resolver */
  onDelete?: (id: number) => Promise<void>;
}

// 36px visibles + 2px de zona extra por lado = 40px de área de toque
const ICON_BUTTON =
  "relative after:absolute after:-inset-0.5 after:content-['']";

const PRESS =
  "active:scale-[0.96] transition-[color,background-color,transform] duration-150 ease-out motion-reduce:transform-none";

// Icono según la forma de pago (el nombre viene del adaptador de cada módulo)
const methodIcon = (label: string) => {
  switch (label) {
    case "Efectivo":
      return Banknote;
    case "Tarjeta":
      return CreditCard;
    case "Yape":
    case "Plin":
      return Smartphone;
    case "Depósito":
      return Landmark;
    case "Transferencia":
      return ArrowLeftRight;
    default:
      return Wallet;
  }
};

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string) =>
  parseLocalDate(value).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function PaymentHistory({
  payments,
  installmentAmount,
  currency = "",
  isLoading = false,
  onEdit,
  onDelete,
}: PaymentHistoryProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const money = (n: number) => `${currency} ${formatNumber(n)}`.trim();

  // Cronológico, con el saldo que queda después de cada pago
  const rows = useMemo(() => {
    const sorted = [...payments].sort((a, b) =>
      a.date === b.date ? a.id - b.id : a.date < b.date ? -1 : 1,
    );
    let running = installmentAmount;
    return sorted.map((payment, index) => {
      running = Math.round((running - payment.total) * 1e4) / 1e4;
      return { payment, number: index + 1, balance: Math.max(0, running) };
    });
  }, [payments, installmentAmount]);

  const totalPaid = payments.reduce((sum, p) => sum + p.total, 0);
  const pending = Math.max(0, installmentAmount - totalPaid);
  const progress =
    installmentAmount > 0
      ? Math.min(100, Math.round((totalPaid / installmentAmount) * 100))
      : 0;
  const isSettled = pending < 0.005 && installmentAmount > 0;

  const confirmDelete = async () => {
    if (deleteId === null || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (!isLoading && payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-8 text-center">
        <p className="text-sm font-medium">Aún no hay pagos</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Los pagos que registres aparecerán aquí, del más antiguo al más
          reciente.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Historial de pagos" aria-busy={isLoading}>
      {/* Avance */}
      <div className="mb-4 rounded-lg border bg-muted/40 p-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">
            Historial de pagos
            {!isLoading && (
              <span className="ml-2 font-normal text-muted-foreground">
                {payments.length} {payments.length === 1 ? "pago" : "pagos"}
              </span>
            )}
          </p>
          {!isLoading && (
            <p className="text-sm tabular-nums text-muted-foreground">
              Pagado{" "}
              <span className="font-semibold text-foreground">
                {money(totalPaid)}
              </span>{" "}
              de {money(installmentAmount)}
            </p>
          )}
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isLoading ? undefined : progress}
          aria-label="Avance de pago de la cuota"
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${isLoading ? 0 : progress}%` }}
          />
        </div>
      </div>

      <ol className="relative space-y-3">
        {/* Hilo de la línea de tiempo */}
        <span
          aria-hidden
          className="absolute bottom-3 left-3 top-3 w-px -translate-x-1/2 bg-border"
        />

        {/* Inicio: la cuota emitida */}
        <li className="relative flex items-center gap-3">
          <span
            aria-hidden
            className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-[10px] text-muted-foreground"
          >
            ●
          </span>
          <p className="text-sm text-muted-foreground">
            Cuota por pagar{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {money(installmentAmount)}
            </span>
          </p>
        </li>

        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <li key={`sk-${i}`} aria-hidden className="relative flex gap-3">
              <Skeleton className="z-10 mt-2.5 size-6 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2 rounded-lg border p-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3.5 w-56" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </li>
          ))}

        {!isLoading &&
          rows.map(({ payment, number, balance }) => {
            const settledHere = balance < 0.005;
            const single = payment.methods.length === 1;
            const hasOperation = payment.reference || payment.bank;
            return (
              <li key={payment.id} className="relative flex gap-3">
                <span
                  aria-hidden
                  className="z-10 mt-2.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                >
                  {number}
                </span>

                <div className="min-w-0 flex-1 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30">
                  {/* Qué pasó, cuánto y cuánto queda */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {formatDate(payment.date)}
                      </p>
                      {payment.code && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {payment.code}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-start gap-1">
                      <div className="text-right">
                        <p className="text-base font-bold tabular-nums text-primary">
                          {money(payment.total)}
                        </p>
                        <p
                          className={cn(
                            "text-xs tabular-nums",
                            settledHere
                              ? "font-medium text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {settledHere
                            ? "Cuota cancelada"
                            : `Saldo ${money(balance)}`}
                        </p>
                      </div>
                      {(onEdit || onDelete) && (
                        <div className="ml-1 flex items-center">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(ICON_BUTTON, PRESS)}
                              aria-label={`Editar pago del ${formatDate(payment.date)}`}
                              title="Editar pago"
                              onClick={() => onEdit(payment.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(ICON_BUTTON, PRESS)}
                              aria-label={`Eliminar pago del ${formatDate(payment.date)}`}
                              title="Eliminar pago"
                              onClick={() => setDeleteId(payment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cómo se pagó. Con un solo método el monto ya está arriba. */}
                  {payment.methods.length > 0 && (
                    <ul aria-label="Forma de pago" className="mt-2 space-y-1">
                      {payment.methods.map((m) => {
                        const Icon = methodIcon(m.label);
                        return (
                          <li
                            key={m.label}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Icon
                                className="size-4 text-muted-foreground"
                                strokeWidth={1.5}
                                aria-hidden
                              />
                              <span className="font-medium">{m.label}</span>
                              {single && hasOperation && (
                                <span className="text-muted-foreground">
                                  ·{" "}
                                  {payment.reference && (
                                    <span className="font-mono text-xs">
                                      {payment.reference}
                                    </span>
                                  )}
                                  {payment.reference && payment.bank && " · "}
                                  {payment.bank}
                                </span>
                              )}
                            </span>
                            {!single && (
                              <span className="tabular-nums">
                                {money(m.amount)}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Con varios métodos, la operación va una sola vez */}
                  {!single && hasOperation && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Operación{" "}
                      {payment.reference && (
                        <span className="font-mono">{payment.reference}</span>
                      )}
                      {payment.reference && payment.bank && " · "}
                      {payment.bank}
                    </p>
                  )}

                  {(payment.observation || payment.registeredBy) && (
                    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground [text-wrap:pretty]">
                      {payment.observation && <p>Nota: {payment.observation}</p>}
                      {payment.registeredBy && (
                        <p>Registrado por {payment.registeredBy}</p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
      </ol>

      {!isLoading && (
        <p
          className={cn(
            "mt-3 text-right text-sm tabular-nums",
            isSettled ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          {isSettled ? "Cuota pagada completamente" : `Saldo pendiente ${money(pending)}`}
        </p>
      )}

      {onDelete && deleteId !== null && (
        <SimpleDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={confirmDelete}
          title="Eliminar pago"
          description="Se eliminará este pago y el saldo de la cuota se recalculará. Esta acción no se puede deshacer."
          confirmText="Eliminar"
          isLoading={isDeleting}
        />
      )}
    </section>
  );
}
