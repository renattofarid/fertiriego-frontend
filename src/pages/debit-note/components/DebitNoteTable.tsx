import type { ColumnDef } from "@tanstack/react-table";
import type { DebitNoteResource } from "../lib/debit-note.interface";
import { DataTable } from "@/components/DataTable";

interface DebitNoteTableProps {
  data: DebitNoteResource[];
  columns: ColumnDef<DebitNoteResource, any>[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function DebitNoteTable({
  data,
  columns,
  isLoading,
  children,
}: DebitNoteTableProps) {
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
