import { DataTable } from "@/components/DataTable";
import type { ProductTypeResource } from "../lib/product-type.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface ProductTypeTableProps {
  isLoading: boolean;
  columns: ColumnDef<ProductTypeResource>[];
  data: ProductTypeResource[];
  children?: React.ReactNode;
}

export default function ProductTypeTable({
  isLoading,
  columns,
  data,
  children,
}: ProductTypeTableProps) {
  return (
    <DataTable isLoading={isLoading} columns={columns} data={data}>
      {children}
    </DataTable>
  );
}
