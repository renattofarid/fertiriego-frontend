import { useEffect, useState } from "react";
import { useValuatedInventory } from "../lib/warehouse-kardex.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { ColumnDef } from "@tanstack/react-table";
import type { ValuatedInventoryItem } from "../lib/warehouse-kardex.interface";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inventoryColumns: ColumnDef<ValuatedInventoryItem>[] = [
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-medium">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "current_stock",
    header: "Stock Actual",
    cell: ({ getValue }) => {
      const stock = getValue() as number;
      const variant =
        stock <= 0 ? "destructive" : stock < 10 ? "secondary" : "default";
      return (
        <Badge variant={variant} className="font-bold">
          {stock}
        </Badge>
      );
    },
  },
  {
    accessorKey: "average_cost",
    header: "Costo Promedio",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-medium">S/ {value.toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "total_value",
    header: "Valor Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-bold text-lg">S/ {value.toFixed(2)}</span>
      );
    },
  },
];

export default function ValuatedInventoryPage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const { data, meta, isLoading, refetch } = useValuatedInventory();
  const { data: warehouses } = useAllWarehouses();

  useEffect(() => {
    refetch();
  }, [page, per_page, selectedWarehouse, refetch]);

  // Calculate totals
  const totalValue = data?.reduce((sum, item) => sum + item.total_value, 0) || 0;
  const totalItems = data?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title="Inventario Valorizado"
          subtitle="Valorización actual del inventario por almacén"
          icon="Warehouse"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total del Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Promedio por Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/ {totalItems > 0 ? (totalValue / totalItems).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={inventoryColumns}
          data={data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <div className="flex items-center gap-2">
            {warehouses && (
              <SearchableSelect
                options={warehouses.map((w) => ({
                  value: w.id.toString(),
                  label: w.name,
                }))}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
                placeholder="Todos los almacenes"
              />
            )}
          </div>
        </DataTable>
      </div>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />
    </div>
  );
}
