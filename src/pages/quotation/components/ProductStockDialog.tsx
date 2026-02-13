import { GeneralModal } from "@/components/GeneralModal";
import { useWarehouseProducts } from "@/pages/warehouse-product/lib/warehouse-product.hook";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Package, Loader2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { WarehouseProductResource } from "@/pages/warehouse-product/lib/warehouse-product.interface";
import { useMemo } from "react";

interface ProductStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
}

export function ProductStockDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductStockDialogProps) {
  const { data, isLoading, error } = useWarehouseProducts({
    product_id: productId,
  });

  const stockData = data?.data || [];

  const columns = useMemo<ColumnDef<WarehouseProductResource>[]>(
    () => [
      {
        accessorKey: "warehouse_name",
        header: "Almacén",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.warehouse_name}</div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock Actual",
        cell: ({ row }) => (
          <div className="text-right font-semibold">
            {row.original.stock.toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "min_stock",
        header: "Stock Mínimo",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.min_stock !== null
              ? row.original.min_stock.toFixed(2)
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "max_stock",
        header: "Stock Máximo",
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.max_stock !== null
              ? row.original.max_stock.toFixed(2)
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const stock = row.original.stock;
          const minStock = row.original.min_stock;
          const maxStock = row.original.max_stock;

          let variant: "default" | "secondary" | "destructive" = "default";
          let label = "Normal";

          if (stock === 0) {
            variant = "destructive";
            label = "Sin Stock";
          } else if (minStock !== null && stock <= minStock) {
            variant = "destructive";
            label = "Bajo";
          } else if (maxStock !== null && stock >= maxStock) {
            variant = "secondary";
            label = "Alto";
          }

          return <Badge variant={variant}>{label}</Badge>;
        },
      },
    ],
    [],
  );

  // Calcular totales
  const totalStock = stockData.reduce((sum, item) => sum + item.stock, 0);
  const warehousesCount = stockData.length;
  const lowStockCount = stockData.filter(
    (item) => item.min_stock !== null && item.stock <= item.min_stock,
  ).length;

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Stock por Almacén - ${productName}`}
      subtitle="Consulta el stock actual de este producto en cada almacén"
      icon="Package"
      size="3xl"
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
                <Package />
              </EmptyMedia>
              <EmptyTitle>Error al cargar el stock</EmptyTitle>
              <EmptyDescription>
                No se pudo cargar el stock del producto
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !stockData || stockData.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>No hay stock registrado</EmptyTitle>
              <EmptyDescription>
                Este producto aún no tiene stock en ningún almacén
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Stock Total</p>
                <p className="text-2xl font-bold">{totalStock.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Almacenes</p>
                <p className="text-2xl font-bold">{warehousesCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold text-destructive">
                  {lowStockCount}
                </p>
              </div>
            </div>

            {/* Tabla de stock */}
            <DataTable
              columns={columns}
              data={stockData}
              isVisibleColumnFilter={false}
              variant="default"
            />
          </>
        )}
      </div>
    </GeneralModal>
  );
}
