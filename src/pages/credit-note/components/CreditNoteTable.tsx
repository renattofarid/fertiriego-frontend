import type { ColumnDef } from "@tanstack/react-table";
import type { CreditNoteResource } from "../lib/credit-note.interface";
import { DataTable } from "@/components/DataTable";

interface CreditNoteTableProps {
  data: CreditNoteResource[];
  columns: ColumnDef<CreditNoteResource, any>[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function CreditNoteTable({
  data,
  columns,
  isLoading,
  children,
}: CreditNoteTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      initialColumnVisibility={{ created_at: false }}
    >
      {children}
    </DataTable>
  );
}
