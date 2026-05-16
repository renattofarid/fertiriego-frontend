import { formatNumber } from "@/lib/formatCurrency";
import type { WarehouseProductResource } from "../lib/warehouse-product.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import { ColumnActions } from "@/components/SelectActions";
import {EditStockModal} from "./WarehouseProductEditStockModal"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Row } from "@tanstack/react-table";

const RowActions = ({ 
  row, 
  onDelete 
}: { 
  row: Row<WarehouseProductResource>; 
  onDelete: (id: number) => void 
}) => {
  const [showEditStock, setShowEditStock] = useState(false);
  const item = row.original;

  return (
    <>
      <ColumnActions>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => setShowEditStock(true)}
          title="Editar Stock"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <DeleteButton onClick={() => onDelete(item.id)} />
      </ColumnActions>

      {showEditStock && (
        <EditStockModal
          open={showEditStock}
          onClose={() => setShowEditStock(false)}
          productId={item.id}
          productName={item.product_name} 
          currentStock={item.stock}
        />
      )}
    </>
  );
};

export const WarehouseProductColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ColumnDef<WarehouseProductResource>[] => [
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock;
      const minStock = row.original.min_stock;
      const maxStock = row.original.max_stock;

      let variant: "default" | "destructive" | "outline" = "default";

      if (minStock !== null && stock < minStock) {
        variant = "destructive";
      } else if (maxStock !== null && stock > maxStock) {
        variant = "outline";
      } else if (minStock !== null && stock >= minStock) {
        variant = "default";
      }

      return <Badge variant={variant}>{formatNumber(stock, 0)}</Badge>;
    },
  },
  {
    accessorKey: "min_stock",
    header: "Stock Mínimo",
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return value !== null ? (
        <span className="font-mono">{formatNumber(value, 0)}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "max_stock",
    header: "Stock Máximo",
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return value !== null ? (
        <span className="font-mono">{formatNumber(value, 0)}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <RowActions row= {row} onDelete={onDelete}></RowActions>
    )
  },
];
