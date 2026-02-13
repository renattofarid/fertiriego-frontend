import { GeneralModal } from "@/components/GeneralModal";
import { useProductSalesHistory } from "../lib/quotation.hook";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { History, Loader2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductSalesHistoryItem } from "../lib/quotation.interface";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductSalesHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
}

export function ProductSalesHistoryDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductSalesHistoryDialogProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useProductSalesHistory(
    {
      productId,
      page,
      per_page: 10,
    },
    open,
  );

  const columns = useMemo<ColumnDef<ProductSalesHistoryItem>[]>(
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
            {row.original.moneda === "PEN" ? "S/" : row.original.moneda === "USD" ? "$" : "€"}{" "}
            {parseFloat(row.original.precio_unitario).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <div className="text-right font-semibold">
            {row.original.moneda === "PEN" ? "S/" : row.original.moneda === "USD" ? "$" : "€"}{" "}
            {parseFloat(row.original.total).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "cliente",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="text-sm max-w-[200px] truncate" title={row.original.cliente}>
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Histórico de Ventas - ${productName}`}
      icon="History"
      size="4xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4">
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
              <EmptyTitle>Error al cargar el histórico</EmptyTitle>
              <EmptyDescription>
                No se pudo cargar el histórico de ventas del producto
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !data || data.data.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>No hay histórico de ventas</EmptyTitle>
              <EmptyDescription>
                Este producto aún no tiene ventas registradas
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {/* Resumen rápido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Ventas</p>
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

            {/* Tabla de histórico */}
            <DataTable
              columns={columns}
              data={data.data}
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
                    size="sm"
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
                    size="sm"
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
