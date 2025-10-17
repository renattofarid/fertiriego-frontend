import { getPurchaseColumns } from "./PurchaseColumns";
import type { PurchaseResource } from "../lib/purchase.interface";
import { DataTable } from "@/components/DataTable";

interface PurchaseTableProps {
  data: PurchaseResource[];
  onEdit: (purchase: PurchaseResource) => void;
  onDelete: (id: number) => void;
}

export const PurchaseTable = ({ data, onEdit, onDelete }: PurchaseTableProps) => {
  const columns = getPurchaseColumns({ onEdit, onDelete });

  return <DataTable columns={columns} data={data} />;
};
