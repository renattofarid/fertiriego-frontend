import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormSelect } from "@/components/FormSelect";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Layers,
  Package,
  RefreshCcw,
  Search,
  ShoppingCart,
  UserX,
} from "lucide-react";
import { getSuggestedLots } from "../lib/purchase-order-batch.actions";
import type {
  LotOrderConfig,
  SuggestedLot,
} from "../lib/purchase-order-batch.interface";
import { errorToast } from "@/lib/core.function";
import EmptyState from "@/components/EmptyState";
import { Checkbox } from "@/components/ui/checkbox";
import { useSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

const URGENCY_OPTIONS = [
  { value: "", label: "Todas las urgencias" },
  { value: "CRITICO", label: "Crítico" },
  { value: "ADVERTENCIA", label: "Advertencia" },
];

const URGENCY_LABEL: Record<string, string> = {
  CRITICO: "Crítico",
  ADVERTENCIA: "Advertencia",
};

interface SuggestionsStepProps {
  onNext: (configs: LotOrderConfig[]) => void;
}

export default function SuggestionsStep({ onNext }: SuggestionsStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedLot[] | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<
    Record<string, boolean>
  >({});
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );

  const filterForm = useForm({
    defaultValues: {
      supplier_id: "",
      urgency: "",
      warehouse_id: "",
    },
  });

  const warehouseId = filterForm.watch("warehouse_id");

  const { data: warehousesData } = useWarehouses();
  const warehouses: WarehouseResource[] = warehousesData?.data ?? [];

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const values = filterForm.getValues();
      const result = await getSuggestedLots({
        supplier_id: values.supplier_id ? Number(values.supplier_id) : null,
        urgency: values.urgency || null,
        warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
      });
      const lots = Array.isArray(result) ? result : [];
      setSuggestions(lots);

      const newSuppliers: Record<string, boolean> = {};
      const newItems: Record<string, boolean> = {};
      lots.forEach((lot) => {
        newSuppliers[String(lot.supplier_id)] = true;
        lot.items.forEach((item) => {
          newItems[`${lot.supplier_id}-${item.product_id}`] = true;
        });
      });
      setSelectedSuppliers(newSuppliers);
      setSelectedItems(newItems);
    } catch (e: any) {
      errorToast(
        e?.response?.data?.message ?? "Error al obtener sugerencias"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSupplier = (supplierId: number | null, lots: SuggestedLot[]) => {
    const sKey = String(supplierId);
    const lot = lots.find((l) => l.supplier_id === supplierId);
    if (!lot) return;
    const newVal = !selectedSuppliers[sKey];
    setSelectedSuppliers((prev) => ({ ...prev, [sKey]: newVal }));
    const newItems = { ...selectedItems };
    lot.items.forEach((item) => {
      newItems[`${supplierId}-${item.product_id}`] = newVal;
    });
    setSelectedItems(newItems);
  };

  const toggleItem = (supplierId: number | null, productId: number) => {
    const key = `${supplierId}-${productId}`;
    const sKey = String(supplierId);
    const newVal = !selectedItems[key];
    const newItems = { ...selectedItems, [key]: newVal };
    setSelectedItems(newItems);

    if (suggestions) {
      const lot = suggestions.find((l) => l.supplier_id === supplierId);
      if (lot) {
        const anySelected = lot.items.some(
          (item) => !!newItems[`${supplierId}-${item.product_id}`]
        );
        setSelectedSuppliers((prev) => ({
          ...prev,
          [sKey]: anySelected,
        }));
      }
    }
  };

  const handleNext = () => {
    if (!suggestions) return;

    const configs: LotOrderConfig[] = suggestions
      .filter((lot) => selectedSuppliers[String(lot.supplier_id)])
      .map((lot) => ({
        supplier_id: lot.supplier_id,
        supplier_id_selected: "",
        supplier_name: lot.supplier_name,
        warehouse_id: warehouseId,
        currency: "PEN" as const,
        apply_igv: false,
        payment_type: "CONTADO",
        days: "",
        expected_date: "",
        observations: "",
        items: lot.items.map((item) => {
          const roundedQuantity = Math.round(item.quantity_suggested ?? 1);
          return {
            product_id: item.product_id,
            product_name: item.product_name,
            quantity_requested: String(roundedQuantity),
            min_quantity: roundedQuantity,
            unit_price_estimated: String(item.unit_price_estimated ?? 0),
            suggestion_reason: item.suggestion_reason,
            urgency_at_creation: item.urgency,
            selected: !!selectedItems[`${lot.supplier_id}-${item.product_id}`],
          };
        }),
      }))
      .filter((cfg) => cfg.items.some((i) => i.selected));

    if (configs.length === 0) {
      errorToast("Selecciona al menos un proveedor con ítems activos.");
      return;
    }

    onNext(configs);
  };

  const selectedCount = Object.values(selectedSuppliers).filter(Boolean).length;
  const canProceed = selectedCount > 0 && !!warehouseId;

  const lotCount = suggestions?.length ?? 0;
  const lotsLabel =
    lotCount === 1 ? "1 lote sugerido" : `${lotCount} lotes sugeridos`;
  const selectedLabel =
    selectedCount === 1 ? "1 seleccionado" : `${selectedCount} seleccionados`;

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <Form {...filterForm}>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end rounded-lg border border-border bg-muted/40 p-4">
          <FormSelectAsync
            control={filterForm.control}
            name="supplier_id"
            label="Proveedor"
            placeholder="Todos los proveedores"
            useQueryHook={useSuppliers}
            mapOptionFn={(p: PersonResource) => ({
              value: p.id.toString(),
              label: p.business_name ?? `${p.names} ${p.father_surname}`,
              description: p.number_document,
            })}
          />

          <FormSelect
            control={filterForm.control}
            name="urgency"
            label="Urgencia"
            placeholder="Todas"
            options={URGENCY_OPTIONS}
          />

          <FormSelect
            control={filterForm.control}
            name="warehouse_id"
            label="Almacén destino *"
            placeholder="Selecciona un almacén"
            options={[
              { value: "", label: "Selecciona un almacén" },
              ...warehouses.map((w) => ({
                value: w.id.toString(),
                label: w.name,
              })),
            ]}
          />

          <Button onClick={handleSearch} disabled={isLoading} className="h-9">
            {isLoading ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Buscar</span>
          </Button>
        </div>
      </Form>

      {/* Estado inicial */}
      {suggestions === null && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium">Genera órdenes de compra por lote</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            El sistema revisará el stock actual y sugerirá productos para
            reponer, agrupados por proveedor. Selecciona un almacén destino y
            presiona «Buscar» para comenzar.
          </p>
        </div>
      )}

      {/* Resultados */}
      {suggestions !== null && (
        <>
          {suggestions.length === 0 ? (
            <EmptyState
              title="Sin sugerencias disponibles"
              description="No hay productos con bajo stock que requieran reposición con los filtros actuales."
              icon={ShoppingCart}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {lotsLabel} — selecciona los que deseas generar
                </p>
                <Badge variant="secondary">{selectedLabel}</Badge>
              </div>

              <div className="overflow-hidden rounded-lg border border-border">
                {suggestions.map((lot, lotIndex) => {
                  const lotSelected = !!selectedSuppliers[String(lot.supplier_id)];
                  const lotItemCount = lot.items.filter(
                    (item) =>
                      !!selectedItems[`${lot.supplier_id}-${item.product_id}`]
                  ).length;

                  return (
                    <div
                      key={lot.supplier_id}
                      className={lotIndex > 0 ? "border-t border-border" : ""}
                    >
                      {/* Cabecera de proveedor */}
                      <div
                        className={`flex items-center gap-3 bg-muted/50 px-4 py-3 transition-opacity ${
                          !lotSelected ? "opacity-60" : ""
                        }`}
                      >
                        <Checkbox
                          checked={lotSelected}
                          onCheckedChange={() =>
                            toggleSupplier(lot.supplier_id, suggestions)
                          }
                          aria-label={`Seleccionar lote de ${lot.supplier_name}`}
                        />
                        {lot.supplier_id === null ? (
                          <UserX className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="flex-1 text-sm font-semibold">
                          {lot.supplier_name}
                        </span>
                        {lot.supplier_id === null && (
                          <Badge variant="yellow" className="text-xs">
                            Asignar proveedor
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {lotItemCount}/{lot.items.length} ítems
                        </Badge>
                      </div>

                      {/* Filas de producto */}
                      {lot.items.map((item) => {
                        const key = `${lot.supplier_id}-${item.product_id}`;
                        const itemSelected = !!selectedItems[key];
                        const urgencyLabel = item.urgency
                          ? (URGENCY_LABEL[item.urgency] ?? item.urgency)
                          : null;

                        return (
                          <div
                            key={item.product_id}
                            className={`flex items-center gap-3 border-t border-border/50 px-4 py-2.5 pl-10 transition-opacity ${
                              !lotSelected || !itemSelected ? "opacity-50" : ""
                            }`}
                          >
                            <Checkbox
                              checked={itemSelected && lotSelected}
                              disabled={!lotSelected}
                              onCheckedChange={() =>
                                toggleItem(lot.supplier_id, item.product_id)
                              }
                              aria-label={`Seleccionar ${item.product_name}`}
                            />
                            <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium leading-tight">
                                {item.product_name}
                              </p>
                              {item.suggestion_reason && (
                                <p className="text-xs text-muted-foreground">
                                  {item.suggestion_reason}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right text-sm tabular-nums">
                              <span className="font-medium text-primary">
                                {item.quantity_suggested != null
                                  ? Math.round(item.quantity_suggested)
                                  : "—"}
                              </span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                und
                              </span>
                            </div>
                            <div className="w-20 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                              S/. {(item.unit_price_estimated ?? 0).toFixed(2)}
                            </div>
                            {urgencyLabel ? (
                              <Badge
                                variant={
                                  item.urgency === "CRITICO"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="shrink-0 text-xs"
                              >
                                {item.urgency === "CRITICO" && (
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                )}
                                {urgencyLabel}
                              </Badge>
                            ) : (
                              <div className="w-20 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                {!warehouseId && (
                  <p className="text-xs text-muted-foreground">
                    Selecciona un almacén destino para continuar
                  </p>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  aria-disabled={!canProceed}
                >
                  Configurar lotes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
