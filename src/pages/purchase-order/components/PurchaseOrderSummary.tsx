import { FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import type { UseFormReturn } from "react-hook-form";

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity_requested: string;
  unit_price_estimated: string;
  subtotal: number;
  subtotal_estimated?: number;
}

interface PurchaseOrderSummaryProps {
  form: UseFormReturn<any>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  suppliers: PersonResource[];
  warehouses: WarehouseResource[];
  details: DetailRow[];
  subtotalBase: number;
  igvAmount: number;
  totalWithIgv: number;
  applyIgv: boolean;
  onCancel?: () => void;
}

export function PurchaseOrderSummary({
  form,
  mode,
  isSubmitting,
  suppliers,
  warehouses,
  details,
  subtotalBase,
  igvAmount,
  totalWithIgv,
  applyIgv,
  onCancel,
}: PurchaseOrderSummaryProps) {
  const supplierWatch = form.watch("supplier_id");
  const warehouseWatch = form.watch("warehouse_id");

  // Obtener el proveedor seleccionado
  const selectedSupplier = supplierWatch
    ? suppliers.find((s) => s.id.toString() === supplierWatch)
    : undefined;

  const supplierName = selectedSupplier
    ? (selectedSupplier.business_name ??
      `${selectedSupplier.names} ${selectedSupplier.father_surname} ${selectedSupplier.mother_surname}`)
    : "Sin seleccionar";

  // Obtener el almacén seleccionado
  const selectedWarehouse = warehouseWatch
    ? warehouses.find((w) => w.id.toString() === warehouseWatch)
    : undefined;

  const warehouseName = selectedWarehouse?.name ?? "Sin seleccionar";

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
          <p className="text-xs text-muted-foreground">Orden de Compra</p>
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
                        {detail.quantity_requested} x S/.{" "}
                        {parseFloat(detail.unit_price_estimated).toLocaleString(
                          "es-PE",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </div>
                    <p className="text-xs font-semibold whitespace-nowrap text-primary">
                      S/.{" "}
                      {detail.subtotal.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
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
                {formatCurrency(subtotalBase, {
                  currencySymbol: "S/.",
                  decimals: 2,
                })}
              </span>
            </div>

            {applyIgv && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IGV (18%)</span>
                <span className="font-medium">
                  {formatCurrency(igvAmount, {
                    currencySymbol: "S/.",
                    decimals: 2,
                  })}
                </span>
              </div>
            )}

            <Separator className="bg-primary/20" />

            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
              <span className="text-base font-semibold text-primary">
                Total {applyIgv ? "(con IGV)" : ""}
              </span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(applyIgv ? totalWithIgv : subtotalBase, {
                  currencySymbol: "S/.",
                  decimals: 2,
                })}
              </span>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Monto estimado
            </p>
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
                  ? "Actualizar Orden"
                  : "Guardar Orden"}
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
            {form.watch("expected_date") && (
              <p className="text-xs text-center text-muted-foreground mt-1">
                <span className="font-semibold">Fecha esperada:</span>{" "}
                {new Date(
                  form.watch("expected_date") + "T00:00:00",
                ).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
