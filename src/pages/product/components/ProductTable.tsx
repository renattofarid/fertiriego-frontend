import { DataTable } from "@/components/DataTable.tsx";
import type { ProductResource } from "../lib/product.interface";
import type { ColumnDef, OnChangeFn, RowSelectionState } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<ProductResource>[];
  data: ProductResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean;
}

export default function ProductTable({
  columns,
  data,
  children,
  isLoading,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{ technical_sheet: false, product_images: false }}
        enableRowSelection={enableRowSelection}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => row.id.toString()}
      >
        {children}
      </DataTable>
    </div>
  );
}
