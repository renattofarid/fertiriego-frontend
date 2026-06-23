import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormSelect } from "@/components/FormSelect";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Package,
  RefreshCcw,
  Search,
  ShoppingCart,
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

interface SuggestionsStepProps {
  onNext: (configs: LotOrderConfig[]) => void;
}

export default function SuggestionsStep({ onNext }: SuggestionsStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedLot[] | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<
    Record<number, boolean>
  >({});
  const [selectedItems, setSelectedItems] = useState<
    Record<string, boolean>
  >({});

  const filterForm = useForm({
    defaultValues: {
      supplier_id: "",
      urgency: "",
      warehouse_id: "",
    },
  });

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

      // Auto-select all
      const newSuppliers: Record<number, boolean> = {};
      const newItems: Record<string, boolean> = {};
      lots.forEach((lot) => {
        newSuppliers[lot.supplier_id] = true;
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

  const toggleSupplier = (supplierId: number, lots: SuggestedLot[]) => {
    const lot = lots.find((l) => l.supplier_id === supplierId);
    if (!lot) return;
    const newVal = !selectedSuppliers[supplierId];
    setSelectedSuppliers((prev) => ({ ...prev, [supplierId]: newVal }));
    const newItems = { ...selectedItems };
    lot.items.forEach((item) => {
      newItems[`${supplierId}-${item.product_id}`] = newVal;
    });
    setSelectedItems(newItems);
  };

  const toggleItem = (supplierId: number, productId: number) => {
    const key = `${supplierId}-${productId}`;
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (!suggestions) return;

    const configs: LotOrderConfig[] = suggestions
      .filter((lot) => selectedSuppliers[lot.supplier_id])
      .map((lot) => ({
        supplier_id: lot.supplier_id,
        supplier_name: lot.supplier_name,
        warehouse_id: filterForm.getValues("warehouse_id") || "",
        currency: "PEN" as const,
        apply_igv: false,
        payment_type: "CONTADO",
        days: "",
        expected_date: "",
        observations: "",
        items: lot.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity_requested: String(item.quantity_suggested ?? 1),
          unit_price_estimated: String(item.unit_price_estimated ?? 0),
          suggestion_reason: item.suggestion_reason,
          urgency_at_creation: item.urgency,
          selected: !!selectedItems[`${lot.supplier_id}-${item.product_id}`],
        })),
      }))
      .filter((cfg) => cfg.items.some((i) => i.selected));

    if (configs.length === 0) {
      errorToast("Selecciona al menos un proveedor con ítems activos.");
      return;
    }

    onNext(configs);
  };

  const selectedCount = Object.values(selectedSuppliers).filter(Boolean).length;
  const hasResults = suggestions !== null && suggestions.length > 0;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtros de búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...filterForm}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormSelectAsync
                control={filterForm.control}
                name="supplier_id"
                label="Proveedor (opcional)"
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
                label="Urgencia (opcional)"
                placeholder="Todas las urgencias"
                options={URGENCY_OPTIONS}
              />

              <FormSelect
                control={filterForm.control}
                name="warehouse_id"
                label="Almacén (opcional)"
                placeholder="Todos los almacenes"
                options={[
                  { value: "", label: "Todos los almacenes" },
                  ...warehouses.map((w) => ({
                    value: w.id.toString(),
                    label: w.name,
                  })),
                ]}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Buscar sugerencias
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

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
                  {suggestions.length} lote(s) sugerido(s) — selecciona los
                  que deseas generar
                </p>
                <Badge variant="secondary">{selectedCount} seleccionado(s)</Badge>
              </div>

              {suggestions.map((lot) => {
                const lotSelected = !!selectedSuppliers[lot.supplier_id];
                const lotItemCount = lot.items.filter(
                  (item) =>
                    !!selectedItems[`${lot.supplier_id}-${item.product_id}`]
                ).length;

                return (
                  <Card
                    key={lot.supplier_id}
                    className={lotSelected ? "" : "opacity-60"}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={lotSelected}
                          onCheckedChange={() =>
                            toggleSupplier(lot.supplier_id, suggestions)
                          }
                        />
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base flex-1">
                          {lot.supplier_name}
                        </CardTitle>
                        <Badge variant="outline">
                          {lotItemCount}/{lot.items.length} ítems
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lot.items.map((item) => {
                          const key = `${lot.supplier_id}-${item.product_id}`;
                          const itemSelected = !!selectedItems[key];
                          return (
                            <div
                              key={item.product_id}
                              className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                checked={itemSelected && lotSelected}
                                disabled={!lotSelected}
                                onCheckedChange={() =>
                                  toggleItem(lot.supplier_id, item.product_id)
                                }
                                className="mt-0.5"
                              />
                              <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">
                                  {item.product_name}
                                </p>
                                {item.suggestion_reason && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {item.suggestion_reason}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm shrink-0 space-y-0.5">
                                <p className="font-medium">
                                  Cant.:{" "}
                                  <span className="text-primary">
                                    {item.quantity_suggested ?? "—"}
                                  </span>
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  P.U.: S/.{" "}
                                  {Number(item.unit_price_estimated).toFixed(2)}
                                </p>
                              </div>
                              {item.urgency && (
                                <Badge
                                  variant={
                                    item.urgency === "CRITICO"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="shrink-0 text-xs"
                                >
                                  {item.urgency === "CRITICO" && (
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                  )}
                                  {item.urgency}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleNext}
                  disabled={selectedCount === 0}
                >
                  Configurar lotes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
