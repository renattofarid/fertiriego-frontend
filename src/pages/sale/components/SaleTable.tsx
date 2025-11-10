import { DataTable } from "@/components/DataTable.tsx";
import type { SaleResource } from "../lib/sale.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<SaleResource>[];
  data: SaleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function SaleTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
