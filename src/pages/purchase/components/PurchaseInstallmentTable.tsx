import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PurchaseInstallmentResource } from "../lib/purchase.interface";

interface PurchaseInstallmentTableProps {
  installments: PurchaseInstallmentResource[];
  onEdit: (installmentId: number) => void;
  onRefresh: () => void;
  isCashPayment?: boolean;
  purchaseTotalAmount?: number;
  onSyncInstallment?: (installmentId: number, newAmount: number) => void;
}

export function PurchaseInstallmentTable({
  installments,
  onEdit,
  isCashPayment = false,
  purchaseTotalAmount,
  onSyncInstallment,
}: PurchaseInstallmentTableProps) {
  const calculateTotal = () => {
    return installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);
  };

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" = "secondary";
    if (status === "PAGADO") variant = "default";
    if (status === "VENCIDO") variant = "destructive";

    return <Badge variant={variant}>{status}</Badge>;
  };

  if (!installments || installments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Badge variant="outline" className="text-lg p-3">
          No hay cuotas en esta compra
        </Badge>
        <p className="text-sm mt-2">Esta compra no tiene cuotas registradas</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Correlativo</TableHead>
            <TableHead className="text-center">Cuota #</TableHead>
            <TableHead className="text-right">Días Venc.</TableHead>
            <TableHead>Fecha Venc.</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((inst) => (
            <TableRow key={inst.id}>
              <TableCell>
                <span className="text-sm font-semibold text-blue-600">
                  {inst.correlativo}
                </span>
              </TableCell>
              <TableCell className="text-center font-medium">
                {inst.installment_number}
              </TableCell>
              <TableCell className="text-right">{inst.due_days}</TableCell>
              <TableCell>
                {new Date(inst.due_date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {parseFloat(inst.amount).toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-semibold text-orange-600">
                {parseFloat(inst.pending_amount).toFixed(2)}
              </TableCell>
              <TableCell>{getStatusBadge(inst.status)}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  {inst.status === "PAGADO" || isCashPayment ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="cursor-not-allowed"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {inst.status === "PAGADO"
                              ? "No se puede editar una cuota pagada"
                              : "No se puede editar una cuota de pago al contado"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(inst.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Botón de sincronizar para cuotas al contado desincronizadas */}
                  {isCashPayment &&
                    purchaseTotalAmount &&
                    onSyncInstallment &&
                    parseFloat(inst.pending_amount) === parseFloat(inst.amount) &&
                    Math.abs(parseFloat(inst.amount) - purchaseTotalAmount) > 0.01 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSyncInstallment(inst.id, purchaseTotalAmount)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sincronizar con total de compra ({purchaseTotalAmount.toFixed(2)})</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-sidebar">
            <TableCell colSpan={4} className="text-right font-bold">
              TOTAL:
            </TableCell>
            <TableCell className="text-right font-bold text-lg text-blue-600">
              {calculateTotal().toFixed(2)}
            </TableCell>
            <TableCell colSpan={3}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
