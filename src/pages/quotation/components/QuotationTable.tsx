import { DataTable } from "@/components/DataTable.tsx";
import type { QuotationResource } from "../lib/quotation.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<QuotationResource>[];
  data: QuotationResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function QuotationTable({
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
        initialColumnVisibility={{
          id: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
