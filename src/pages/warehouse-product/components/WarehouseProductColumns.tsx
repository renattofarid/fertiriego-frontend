import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/formatCurrency";
import { SelectActions } from "@/components/SelectActions";
import type { WarehouseProductResource } from "../lib/warehouse-product.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const WarehouseProductColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
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
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
