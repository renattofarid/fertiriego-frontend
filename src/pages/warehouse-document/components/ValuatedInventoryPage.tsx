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
import ValuatedInventorySummary from "./ValuatedInventorySummary";

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
    accessorKey: "quantity_balance",
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
    accessorKey: "unit_cost",
    header: "Costo Unitario",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-medium">S/ {Number(value).toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "average_cost",
    header: "Costo Promedio",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-medium text-blue-600">S/ {Number(value).toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "total_cost_balance",
    header: "Valor Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-bold text-lg text-primary">S/ {Number(value).toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "movement_date",
    header: "Última Actualización",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
];

export default function ValuatedInventoryPage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const { data: warehouses } = useAllWarehouses();

  const params = {
    page,
    per_page,
    warehouse_id: selectedWarehouse ? Number(selectedWarehouse) : undefined,
  };

  const { data, meta, isLoading, refetch } = useValuatedInventory(params);

  useEffect(() => {
    refetch(params);
  }, [page, per_page, selectedWarehouse]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title="Inventario Valorizado"
          subtitle="Valorización actual del inventario por almacén"
          icon="Warehouse"
        />
      </div>

      <ValuatedInventorySummary items={data || []} />

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
