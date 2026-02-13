import { FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { formatNumber } from "@/lib/formatCurrency";
import type { UseFormReturn } from "react-hook-form";

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_price: string;
  tax: string;
  subtotal: number;
  total: number;
}

interface InstallmentRow {
  due_days: string;
  amount: string;
}

interface PurchaseSummaryProps {
  form: UseFormReturn<any>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  warehouses: WarehouseResource[];
  details: DetailRow[];
  installments?: InstallmentRow[];
  calculateSubtotalTotal: () => number;
  calculateTaxTotal: () => number;
  calculateDetailsTotal: () => number;
  installmentsMatchTotal?: () => boolean;
  selectedSupplier?: PersonResource;
  onCancel?: () => void;
  selectedPaymentType?: string;
}

export function PurchaseSummary({
  form,
  mode,
  isSubmitting,
  warehouses,
  details,
  installments = [],
  calculateSubtotalTotal,
  calculateTaxTotal,
  calculateDetailsTotal,
  installmentsMatchTotal,
  selectedSupplier,
  onCancel,
  selectedPaymentType,
}: PurchaseSummaryProps) {
  const warehouseWatch = form.watch("warehouse_id");
  const documentTypeWatch = form.watch("document_type");
  const currencyWatch = form.watch("currency");

  const supplierName = selectedSupplier
    ? (selectedSupplier.business_name ??
      `${selectedSupplier.names} ${selectedSupplier.father_surname} ${selectedSupplier.mother_surname}`)
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
            {documentTypeWatch ?? "Compra"}
          </p>
          {selectedPaymentType && (
            <Badge variant="secondary" className="w-fit">
              {selectedPaymentType}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información del Proveedor */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">
              Proveedor
            </p>
            <p className="text-sm font-semibold">{supplierName}</p>
            {selectedSupplier && (
              <>
                {selectedSupplier.number_document && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">RUC/DNI:</span>{" "}
                    {selectedSupplier.number_document}
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Dirección:</span>{" "}
                    {selectedSupplier.address}
                  </div>
                )}
                {selectedSupplier.phone && selectedSupplier.phone !== "0" && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Teléfono:</span>{" "}
                    {selectedSupplier.phone}
                  </div>
                )}
                {selectedSupplier.email && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedSupplier.email}
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
                        {detail.quantity} x {currencySymbol}{" "}
                        {parseFloat(detail.unit_price).toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <p className="text-xs font-semibold whitespace-nowrap text-primary">
                      {currencySymbol}{" "}
                      {detail.total.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Totales */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {currencySymbol} {formatNumber(calculateSubtotalTotal())}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">IGV (18%)</span>
              <span className="font-medium">
                {currencySymbol} {formatNumber(calculateTaxTotal())}
              </span>
            </div>

            <Separator className="bg-primary/20" />

            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
              <span className="text-base font-semibold text-primary">
                Total
              </span>
              <span className="text-xl font-bold text-primary">
                {currencySymbol} {formatNumber(calculateDetailsTotal())}
              </span>
            </div>
            {selectedPaymentType && (
              <p className="text-xs text-center text-muted-foreground">
                Tipo de pago:{" "}
                <span className="font-semibold">{selectedPaymentType}</span>
              </p>
            )}
          </div>

          <Separator className="bg-muted-foreground/20" />

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
                  installments.length > 0 &&
                  installmentsMatchTotal &&
                  !installmentsMatchTotal())
              }
            >
              <FileCheck className="size-4 mr-2" />
              {isSubmitting
                ? "Guardando..."
                : mode === "edit"
                  ? "Actualizar Compra"
                  : "Guardar Compra"}
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
