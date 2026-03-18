import { FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import { formatNumber } from "@/lib/formatCurrency";
import { truncTo2 } from "@/lib/saleCalculations";
import type { UseFormReturn } from "react-hook-form";

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
}

interface InstallmentRow {
  due_days: string;
  amount: string;
}

interface SaleSummaryProps {
  form: UseFormReturn<any>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  selectedCustomer?: PersonResource;
  warehouses: WarehouseResource[];
  details: DetailRow[];
  installments?: InstallmentRow[];
  calculateDetailsSubtotal: () => number;
  calculateDetailsIGV: () => number;
  calculateDetailsTotal: () => number;
  calculateRetencion?: () => number;
  calculateNetTotal?: () => number;
  calculatePaymentTotal?: () => number;
  installmentsMatchTotal?: () => boolean;
  paymentAmountsMatchTotal?: () => boolean;
  onCancel?: () => void;
  selectedPaymentType?: string;
  tipoCambio?: string;
  porcentajeIgv?: number;
  totalExonerada?: number;
  totalInafecta?: number;
}

export function SaleSummary({
  form,
  mode,
  isSubmitting,
  selectedCustomer,
  warehouses,
  details,
  installments = [],
  calculateDetailsSubtotal,
  calculateDetailsIGV,
  calculateDetailsTotal,
  calculateRetencion,
  calculateNetTotal,
  calculatePaymentTotal: _calculatePaymentTotal,
  installmentsMatchTotal,
  paymentAmountsMatchTotal,
  onCancel,
  selectedPaymentType,
  tipoCambio,
  porcentajeIgv = 18,
  totalExonerada = 0,
  totalInafecta = 0,
}: SaleSummaryProps) {
  const warehouseWatch = form.watch("warehouse_id");
  const documentTypeWatch = form.watch("document_type");
  const currencyWatch = form.watch("currency");

  const customerName = selectedCustomer
    ? (selectedCustomer.business_name ??
      `${selectedCustomer.names} ${selectedCustomer.father_surname} ${selectedCustomer.mother_surname}`)
    : "Sin seleccionar";

  // Obtener el almacén seleccionado
  const selectedWarehouse = warehouseWatch
    ? warehouses.find((w) => w.id.toString() === warehouseWatch)
    : undefined;

  const warehouseName = selectedWarehouse?.name ?? "Sin seleccionar";

  // Obtener el símbolo de moneda
  const getCurrencySymbol = () => {
    switch (currencyWatch) {
      case "USD":
        return "$";
      case "PEN":
        return "S/";
      case "EUR":
        return "€";
      default:
        return "S/";
    }
  };

  const currencySymbol = getCurrencySymbol();

  return (
    <div className="xl:col-span-1 xl:row-start-1 xl:col-start-3 h-full">
      <Card className="h-full sticky top-6 bg-linear-to-br from-primary/5 via-background to-muted/20 border-primary/20">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="size-5 text-primary" />
              Resumen
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30"
            >
              {mode === "edit" ? "Edición" : "Nuevo"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {documentTypeWatch ?? "Venta"}
          </p>
          {selectedPaymentType && (
            <Badge variant="secondary" className="w-fit">
              {selectedPaymentType}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información del Cliente */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">Cliente</p>
            <p className="text-sm font-semibold">{customerName}</p>
            {selectedCustomer && (
              <>
                {selectedCustomer.number_document && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">RUC/DNI:</span>{" "}
                    {selectedCustomer.number_document}
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Dirección:</span>{" "}
                    {selectedCustomer.address}
                  </div>
                )}
                {selectedCustomer.phone && selectedCustomer.phone !== "0" && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Teléfono:</span>{" "}
                    {selectedCustomer.phone}
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedCustomer.email}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Información del Almacén */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">Almacén</p>
            <p className="text-sm font-semibold">{warehouseName}</p>
            {selectedWarehouse && (
              <>
                {selectedWarehouse.address && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Ubicación:</span>{" "}
                    {selectedWarehouse.address}
                  </div>
                )}
              </>
            )}
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Items Summary */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Productos ({details.length})
            </p>
            <div className="space-y-2 pr-2 max-h-[250px] overflow-y-auto">
              {details.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-4">
                  No hay productos agregados
                </p>
              ) : (
                details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start gap-2 text-sm p-2 rounded bg-background/50 border border-muted-foreground/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs whitespace-pre-line truncate">
                        {detail.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(parseFloat(detail.quantity))} x {currencySymbol}{" "}
                        {formatNumber(parseFloat(detail.unit_price))}
                      </p>
                    </div>
                    <p className="text-xs font-semibold whitespace-nowrap text-primary">
                      {currencySymbol} {formatNumber(truncTo2(detail.total))}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Tipo de cambio */}
          {tipoCambio && (
            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-muted-foreground">Tipo de Cambio</span>
              <span className="font-medium">S/ {tipoCambio}</span>
            </div>
          )}

          {/* Totales */}
          <div className="space-y-3 border pt-2 rounded-lg">
            <div className="flex justify-between items-center text-sm px-2">
              <span className="text-muted-foreground font-mono uppercase">
                Op. Gravada
              </span>
              <span className="font-medium">
                {currencySymbol}{" "}
                {formatNumber(truncTo2(calculateDetailsSubtotal()))}
              </span>
            </div>

            {totalExonerada > 0 && (
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-muted-foreground font-mono uppercase">
                  Op. Exonerada
                </span>
                <span className="font-medium">
                  {currencySymbol} {formatNumber(truncTo2(totalExonerada))}
                </span>
              </div>
            )}

            {totalInafecta > 0 && (
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-muted-foreground font-mono uppercase">
                  Op. Inafecta
                </span>
                <span className="font-medium">
                  {currencySymbol} {formatNumber(truncTo2(totalInafecta))}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm px-2">
              <span className="text-muted-foreground font-mono uppercase">
                IGV ({porcentajeIgv}%)
              </span>
              <span className="font-medium">
                {currencySymbol} {formatNumber(truncTo2(calculateDetailsIGV()))}
              </span>
            </div>

            {calculateRetencion && calculateRetencion() > 0 && (
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-muted-foreground font-mono uppercase">
                  Retención IGV (3%)
                </span>
                <span className="font-medium text-destructive">
                  - {currencySymbol} {formatNumber(truncTo2(calculateRetencion()))}
                </span>
              </div>
            )}

            <div className="border border-dashed border-primary/20 m-0" />

            <div className="flex justify-between items-center p-3 bg-muted rounded-b-lg">
              <span className="text-base font-semibold font-mono uppercase text-primary dark:text-primary">
                {calculateRetencion && calculateRetencion() > 0
                  ? "Total a Cobrar"
                  : "Total"}
              </span>
              <span className="text-2xl font-medium text-primary dark:text-primary">
                {currencySymbol}{" "}
                {formatNumber(
                  truncTo2(calculateNetTotal
                    ? calculateNetTotal()
                    : calculateDetailsTotal()),
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                isSubmitting ||
                (mode === "create" && details.length === 0) ||
                (mode === "create" &&
                  selectedPaymentType === "CREDITO" &&
                  installments.length === 0) ||
                (mode === "create" &&
                  selectedPaymentType === "CONTADO" &&
                  paymentAmountsMatchTotal &&
                  !paymentAmountsMatchTotal()) ||
                (mode === "create" &&
                  installments.length > 0 &&
                  installmentsMatchTotal &&
                  !installmentsMatchTotal())
              }
            >
              <FileCheck className="size-4 mr-2" />
              {isSubmitting
                ? "Guardando..."
                : mode === "edit"
                  ? "Actualizar Venta"
                  : "Guardar Venta"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-muted-foreground/10">
            <p className="text-xs text-center text-muted-foreground">
              {form.watch("issue_date")
                ? new Date(
                    form.watch("issue_date") + "T00:00:00",
                  ).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Sin fecha de emisión"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
