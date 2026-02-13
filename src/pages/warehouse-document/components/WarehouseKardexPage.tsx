import { useEffect, useState } from "react";
import { useWarehouseKardex } from "../lib/warehouse-kardex.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { ColumnDef } from "@tanstack/react-table";
import type { WarehouseKardexResource } from "../lib/warehouse-kardex.interface";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { getDocumentTypeLabel } from "../lib/warehouse-document.constants";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import {
  DOCUMENT_TYPES,
  MOVEMENT_TYPES,
} from "../lib/warehouse-document.constants";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

const kardexColumns: ColumnDef<WarehouseKardexResource>[] = [
  {
    accessorKey: "movement_date",
    header: "Fecha",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.original.document_type;
      return (
        <Badge variant="secondary" className="font-medium">
          {getDocumentTypeLabel(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "document_number",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "movement_type",
    header: "Movimiento",
    cell: ({ row }) => {
      const type = row.original.movement_type;
      return (
        <Badge variant={type === "ENTRADA" ? "default" : "destructive"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity_in",
    header: "Entrada",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-green-600">{value}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "quantity_out",
    header: "Salida",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-red-600">{value}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "quantity_balance",
    header: "Saldo",
    cell: ({ getValue }) => (
      <span className="font-bold">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "unit_cost",
    header: "Costo Unit.",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return `S/ ${Number(value).toFixed(2)}`;
    },
  },
  {
    accessorKey: "average_cost",
    header: "Costo Promedio",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return `S/ ${Number(value).toFixed(2)}`;
    },
  },
  {
    accessorKey: "total_cost_in",
    header: "Total Entrada",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-green-600">
          S/ {Number(value).toFixed(2)}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "total_cost_out",
    header: "Total Salida",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-red-600">
          S/ {Number(value).toFixed(2)}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "total_cost_balance",
    header: "Saldo Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-bold text-primary">
          S/ {Number(value).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
];

export default function WarehouseKardexPage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [selectedMovementType, setSelectedMovementType] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const { setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const { data: warehouses } = useAllWarehouses();

  const params = {
    page,
    per_page,
    warehouse_id: selectedWarehouse ? Number(selectedWarehouse) : undefined,
    product_id: selectedProduct ? Number(selectedProduct) : undefined,
    document_type: selectedDocumentType || undefined,
    movement_type: selectedMovementType || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  const { data, meta, isLoading, refetch } = useWarehouseKardex(params);

  useEffect(() => {
    refetch(params);
  }, [
    page,
    per_page,
    selectedWarehouse,
    selectedProduct,
    selectedDocumentType,
    selectedMovementType,
    fromDate,
    toDate,
  ]);

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <TitleComponent
          title="Kardex de Almacén"
          subtitle="Historial de movimientos de inventario"
          icon="Activity"
        />
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={kardexColumns}
          data={data || []}
          isLoading={isLoading}
          initialColumnVisibility={{
            user_name: false,
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
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

              <SearchableSelectAsync
                useQueryHook={useProduct}
                mapOptionFn={(product) => ({
                  value: product.id.toString(),
                  label: product.name,
                })}
                value={selectedProduct}
                onChange={setSelectedProduct}
                placeholder="Todos los productos"
              />

              <SearchableSelect
                options={DOCUMENT_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
                value={selectedDocumentType}
                onChange={setSelectedDocumentType}
                placeholder="Todos los tipos"
              />

              <SearchableSelect
                options={MOVEMENT_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
                value={selectedMovementType}
                onChange={setSelectedMovementType}
                placeholder="Todos los movimientos"
              />

              <DateRangePickerFilter
                placeholder="Rango de fechas"
                className="md:min-w-64 w-full md:w-auto"
                dateFrom={fromDate ? new Date(fromDate) : undefined}
                dateTo={toDate ? new Date(toDate) : undefined}
                onDateChange={(from, to) => {
                  setFromDate(from ? from : new Date());
                  setToDate(
                    to ? to : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  );
                }}
              />
            </div>
          </div>
        </DataTable>
      </div>

      {!isLoading && (!data || data.length === 0) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No se encontraron movimientos. Intente verificar los filtros
            seleccionados o ampliar el rango de fechas.
          </AlertDescription>
        </Alert>
      )}

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />
    </PageWrapper>
  );
}
