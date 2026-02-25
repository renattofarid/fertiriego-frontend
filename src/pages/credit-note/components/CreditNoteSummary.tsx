import { FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/formatCurrency";
import type { UseFormReturn } from "react-hook-form";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import type { CreditNoteReason } from "../lib/credit-note.interface";

interface DetailRow {
  sale_detail_id: string;
  product_id: number;
  quantity: number;
  unit_price: number;
}

interface CreditNoteSummaryProps {
  form: UseFormReturn<any>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  selectedSale?: SaleResource;
  creditNoteReasons: CreditNoteReason[];
  details: DetailRow[];
  calculateSubtotal: () => number;
  calculateIGV: () => number;
  calculateTotal: () => number;
  onCancel?: () => void;
}

export function CreditNoteSummary({
  form,
  mode,
  isSubmitting,
  selectedSale,
  creditNoteReasons,
  details,
  calculateSubtotal,
  calculateIGV,
  calculateTotal,
  onCancel,
}: CreditNoteSummaryProps) {
  const creditNoteMotiveWatch = form.watch("credit_note_motive_id");
  const affectsStockWatch = form.watch("affects_stock");

  // Obtener el motivo de la nota de crédito seleccionado
  const selectedMotive = creditNoteMotiveWatch
    ? creditNoteReasons.find((r) => r.id.toString() === creditNoteMotiveWatch)
    : undefined;

  const motiveName = selectedMotive?.name ?? "Sin seleccionar";

  // Obtener información de la venta
  const saleInfo = selectedSale
    ? `${selectedSale.sequential_number} - ${selectedSale.customer_fullname}`
    : "Sin seleccionar";

  // Obtener el símbolo de moneda de la venta
  const getCurrencySymbol = () => {
    switch (selectedSale?.currency) {
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
          <p className="text-xs text-muted-foreground">Nota de Crédito</p>
          {affectsStockWatch !== undefined && (
            <Badge
              variant={affectsStockWatch ? "default" : "secondary"}
              className="w-fit"
            >
              {affectsStockWatch ? "Afecta Stock" : "No afecta stock"}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información de la Venta */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">
              Venta Relacionada
            </p>
            <p className="text-sm font-semibold">{saleInfo}</p>
            {selectedSale && (
              <>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold">Total de la Venta:</span>{" "}
                  {currencySymbol} {formatNumber(selectedSale.total_amount)}
                </div>
              </>
            )}
          </div>

          {/* Información del Motivo */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">
              Motivo de la Nota
            </p>
            <p className="text-sm font-semibold">{motiveName}</p>
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
                details.map((detail, index) => {
                  const saleDetail = selectedSale?.details?.find(
                    (d) => d.id.toString() === detail.sale_detail_id,
                  );
                  const productName = saleDetail?.product?.name ?? "Producto";
                  const total = detail.quantity * detail.unit_price * 1.18;

                  return (
                    <div
                      key={index}
                      className="flex justify-between items-start gap-2 text-sm p-2 rounded bg-background/50 border border-muted-foreground/10"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs whitespace-pre-line truncate">
                          {productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {detail.quantity} x {currencySymbol}{" "}
                          {detail.unit_price.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <p className="text-xs font-semibold whitespace-nowrap text-primary">
                        {currencySymbol}{" "}
                        {total.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Totales */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {currencySymbol} {formatNumber(calculateSubtotal())}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">IGV (18%)</span>
              <span className="font-medium">
                {currencySymbol} {formatNumber(calculateIGV())}
              </span>
            </div>

            <Separator className="bg-primary/20" />

            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
              <span className="text-base font-semibold text-primary">
                Total a Acreditar
              </span>
              <span className="text-xl font-bold text-primary">
                {currencySymbol} {formatNumber(calculateTotal())}
              </span>
            </div>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                isSubmitting || (mode === "create" && details.length === 0)
              }
            >
              <FileCheck className="size-4 mr-2" />
              {isSubmitting
                ? "Guardando..."
                : mode === "edit"
                  ? "Actualizar Nota de Crédito"
                  : "Guardar Nota de Crédito"}
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
