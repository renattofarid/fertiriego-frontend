import { FileCheck, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
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
  mode: "create" | "update";
  isSubmitting: boolean;
  suppliers: PersonResource[];
  warehouses: WarehouseResource[];
  details: DetailRow[];
  installments?: InstallmentRow[];
  calculateSubtotalTotal: () => number;
  calculateTaxTotal: () => number;
  calculateDetailsTotal: () => number;
  installmentsMatchTotal?: () => boolean;
  onCancel?: () => void;
  selectedPaymentType?: string;
}

export function PurchaseSummary({
  form,
  mode,
  isSubmitting,
  suppliers,
  warehouses,
  details,
  installments = [],
  calculateSubtotalTotal,
  calculateTaxTotal,
  calculateDetailsTotal,
  installmentsMatchTotal,
  onCancel,
  selectedPaymentType,
}: PurchaseSummaryProps) {
  const supplierWatch = form.watch("supplier_id");
  const warehouseWatch = form.watch("warehouse_id");
  const documentTypeWatch = form.watch("document_type");
  const currencyWatch = form.watch("currency");

  // Obtener el proveedor seleccionado
  const selectedSupplier = supplierWatch
    ? suppliers.find((s) => s.id.toString() === supplierWatch)
    : undefined;

  const supplierName = selectedSupplier
    ? selectedSupplier.business_name ??
      `${selectedSupplier.names} ${selectedSupplier.father_surname} ${selectedSupplier.mother_surname}`
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
              {mode === "update" ? "Edición" : "Nuevo"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {documentTypeWatch ?? "Compra"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información del Proveedor */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">
              Proveedor
            </p>
            <p className="text-sm font-semibold">{supplierName}</p>
          </div>

          {/* Información del Almacén */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">Almacén</p>
            <p className="text-sm font-semibold">{warehouseName}</p>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Desglose de Precios */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Desglose
            </p>
            <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-muted-foreground/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Productos ({details.length})
                </span>
                <span className="font-medium">
                  {details.length} {details.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {currencySymbol} {formatNumber(calculateSubtotalTotal())}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IGV (18%)</span>
                <span className="font-medium text-primary">
                  + {currencySymbol} {formatNumber(calculateTaxTotal())}
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-primary/20" />

          {/* Total */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-primary">
                Total
              </span>
              <span className="text-xl font-bold text-primary">
                {currencySymbol} {formatNumber(calculateDetailsTotal())}
              </span>
            </div>
            {selectedPaymentType && (
              <p className="text-xs text-primary mt-1">
                Tipo de pago: {selectedPaymentType}
              </p>
            )}
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Botones de Acción */}
          <div className="space-y-2 pt-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                isSubmitting ||
                !form.formState.isValid ||
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
              <Loader
                className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
              />
              {isSubmitting
                ? "Guardando..."
                : mode === "update"
                ? "Actualizar"
                : "Guardar"}
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
        </CardContent>
      </Card>
    </div>
  );
}
