import { useEffect, useState } from "react";
import { Warehouse } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/formatCurrency";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAllWarehouseProducts } from "@/pages/warehouse-product/lib/warehouse-product.actions";
import type { WarehouseProductResource } from "@/pages/warehouse-product/lib/warehouse-product.interface";

interface ProductWarehouseStockProps {
  productId: number;
  /** Si es true, solo se renderiza el contenido (tabla/empty/loading) sin GroupFormSection */
  embedded?: boolean;
}

const StockContent = ({
  items,
  isLoading,
}: {
  items: WarehouseProductResource[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia />
          <EmptyTitle>Sin stock en almacenes</EmptyTitle>
          <EmptyDescription>
            Este producto aún no tiene registros de stock en ningún almacén.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Almacén</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Stock Mín.</TableHead>
          <TableHead className="text-right">Stock Máx.</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => {
          const stock = row.stock;
          const minStock = row.min_stock;
          const maxStock = row.max_stock;
          let variant: "default" | "destructive" | "outline" = "default";
          if (minStock !== null && stock < minStock) {
            variant = "destructive";
          } else if (maxStock !== null && stock > maxStock) {
            variant = "outline";
          }
          return (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {row.warehouse_name}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={variant}>
                  {formatNumber(stock, 0)}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {minStock !== null ? formatNumber(minStock, 0) : "-"}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {maxStock !== null ? formatNumber(maxStock, 0) : "-"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export function ProductWarehouseStock({
  productId,
  embedded = false,
}: ProductWarehouseStockProps) {
  const [items, setItems] = useState<WarehouseProductResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getAllWarehouseProducts({ product_id: productId })
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          const filtered = list.filter((r) => r.product_id === productId);
          setItems(filtered);
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const content = <StockContent items={items} isLoading={isLoading} />;

  if (embedded) {
    return <div className="col-span-full mt-4">{content}</div>;
  }

  return (
    <GroupFormSection
      title="Stock en almacenes"
      cols={{ sm: 1 }}
      icon={Warehouse}
    >
      {content}
    </GroupFormSection>
  );
}
