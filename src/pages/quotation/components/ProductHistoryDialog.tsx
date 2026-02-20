import { GeneralModal } from "@/components/GeneralModal";
import {
  useProductSalesHistory,
  useProductPurchaseHistory,
} from "../lib/quotation.hook";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  History,
  Loader2,
  Users,
  Store,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  ProductSalesHistoryItem,
  ProductPurchaseHistoryItem,
} from "../lib/quotation.interface";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
  customerId?: number;
}

type HistoryType = "ventas" | "compras";

export function ProductHistoryDialog({
  open,
  onOpenChange,
  productId,
  productName,
  customerId,
}: ProductHistoryDialogProps) {
  const [historyType, setHistoryType] = useState<HistoryType>("ventas");
  const [page, setPage] = useState(1);
  const [filterByCustomer, setFilterByCustomer] = useState(false);

  const salesQuery = useProductSalesHistory(
    {
      productId,
      page,
      per_page: 10,
      ...(filterByCustomer && customerId && { customer_id: customerId }),
    },
    open && historyType === "ventas",
  );

  const purchaseQuery = useProductPurchaseHistory(
    { productId, page, per_page: 10 },
    open && historyType === "compras",
  );

  const { data, isLoading, error } =
    historyType === "ventas" ? salesQuery : purchaseQuery;

  const handleTypeChange = (type: HistoryType) => {
    setHistoryType(type);
    setPage(1);
    setFilterByCustomer(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const salesColumns = useMemo<ColumnDef<ProductSalesHistoryItem>[]>(
    () => [
      {
        accessorKey: "documento",
        header: "Documento",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.documento}</div>
        ),
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => (
          <div className="text-sm">
            {new Date(row.original.fecha).toLocaleDateString("es-PE")}
          </div>
        ),
      },
      {
        accessorKey: "cantidad",
        header: "Cant.",
        cell: ({ row }) => (
          <div className="text-right">{row.original.cantidad}</div>
        ),
      },
      {
        accessorKey: "precio_unitario",
        header: "P. Unit.",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.moneda === "PEN"
              ? "S/"
              : row.original.moneda === "USD"
                ? "$"
                : "€"}{" "}
            {parseFloat(row.original.precio_unitario).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <div className="text-right font-semibold">
            {row.original.moneda === "PEN"
              ? "S/"
              : row.original.moneda === "USD"
                ? "$"
                : "€"}{" "}
            {parseFloat(row.original.total).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "cliente",
        header: "Cliente",
        cell: ({ row }) => (
          <div
            className="text-sm max-w-[200px] truncate"
            title={row.original.cliente}
          >
            {row.original.cliente}
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.estado === "PAGADA"
                ? "default"
                : row.original.estado === "PENDIENTE"
                  ? "secondary"
                  : "destructive"
            }
          >
            {row.original.estado}
          </Badge>
        ),
      },
      {
        accessorKey: "margen_ganancia",
        header: "Margen",
        cell: ({ row }) => (
          <div className="text-right text-sm">
            {row.original.margen_ganancia}
          </div>
        ),
      },
    ],
    [],
  );

  const purchaseColumns = useMemo<ColumnDef<ProductPurchaseHistoryItem>[]>(
    () => [
      {
        accessorKey: "documento",
        header: "Documento",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.documento}</div>
        ),
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => (
          <div className="text-sm">
            {new Date(row.original.fecha).toLocaleDateString("es-PE")}
          </div>
        ),
      },
      {
        accessorKey: "cantidad",
        header: "Cant.",
        cell: ({ row }) => (
          <div className="text-right">{row.original.cantidad}</div>
        ),
      },
      {
        accessorKey: "precio_unitario",
        header: "P. Unit.",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.moneda === "PEN"
              ? "S/"
              : row.original.moneda === "USD"
                ? "$"
                : "€"}{" "}
            {parseFloat(row.original.precio_unitario).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <div className="text-right font-semibold">
            {row.original.moneda === "PEN"
              ? "S/"
              : row.original.moneda === "USD"
                ? "$"
                : "€"}{" "}
            {parseFloat(row.original.total).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "proveedor",
        header: "Proveedor",
        cell: ({ row }) => (
          <div
            className="text-sm max-w-[200px] truncate"
            title={row.original.proveedor}
          >
            {row.original.proveedor}
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.estado === "PAGADA"
                ? "default"
                : row.original.estado === "PENDIENTE"
                  ? "secondary"
                  : "destructive"
            }
          >
            {row.original.estado}
          </Badge>
        ),
      },
    ],
    [],
  );

  const isSales = historyType === "ventas";

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Historial - ${productName}`}
      subtitle="Consulta el historial de ventas y compras de este producto"
      icon="History"
      size="4xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4">
        {/* Toggle ventas / compras */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={isSales ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTypeChange("ventas")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Ventas
          </Button>
          <Button
            variant={!isSales ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTypeChange("compras")}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Compras
          </Button>
        </div>

        {/* Filtro por cliente (solo en ventas) */}
        {isSales && customerId && (
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="text-sm text-muted-foreground">
              {filterByCustomer
                ? "Mostrando solo precios de este cliente"
                : "Mostrando todos los precios"}
            </div>
            <Button
              variant={filterByCustomer ? "default" : "outline"}
              onClick={() => {
                setFilterByCustomer(!filterByCustomer);
                setPage(1);
              }}
              className="gap-2"
            >
              {!filterByCustomer ? (
                <>
                  <Users className="h-4 w-4" />
                  Buscar del cliente
                </>
              ) : (
                <>
                  <Store className="h-4 w-4" />
                  Buscar todos los precios
                </>
              )}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Empty className="border border-dashed border-destructive/50">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>Error al cargar el historial</EmptyTitle>
              <EmptyDescription>
                No se pudo cargar el historial de {historyType} del producto
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !data || data.data.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>No hay historial de {historyType}</EmptyTitle>
              <EmptyDescription>
                Este producto aún no tiene {historyType} registradas
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {/* Resumen rápido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total {isSales ? "Ventas" : "Compras"}
                </p>
                <p className="text-2xl font-bold">{data.pagination.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cantidad Total</p>
                <p className="text-2xl font-bold">
                  {data.data
                    .reduce((sum, item) => sum + parseFloat(item.cantidad), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio Promedio</p>
                <p className="text-2xl font-bold">
                  {data.data.length > 0
                    ? (
                        data.data.reduce(
                          (sum, item) => sum + parseFloat(item.precio_unitario),
                          0,
                        ) / data.data.length
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Precio</p>
                <p className="text-2xl font-bold">
                  {data.data.length > 0
                    ? parseFloat(data.data[0].precio_unitario).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>

            {/* Tabla */}
            <DataTable
              columns={
                isSales
                  ? (salesColumns as ColumnDef<
                      ProductSalesHistoryItem | ProductPurchaseHistoryItem
                    >[])
                  : (purchaseColumns as ColumnDef<
                      ProductSalesHistoryItem | ProductPurchaseHistoryItem
                    >[])
              }
              data={
                data.data as (
                  | ProductSalesHistoryItem
                  | ProductPurchaseHistoryItem
                )[]
              }
              isVisibleColumnFilter={false}
              variant="default"
            />

            {/* Paginación */}
            {data.pagination.last_page > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando {data.pagination.from} - {data.pagination.to} de{" "}
                  {data.pagination.total} resultados
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-2 px-3">
                    <span className="text-sm">
                      Página {page} de {data.pagination.last_page}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === data.pagination.last_page}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GeneralModal>
  );
}
