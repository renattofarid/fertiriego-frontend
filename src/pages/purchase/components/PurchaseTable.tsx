import { getPurchaseColumns } from "./PurchaseColumns";
import type { PurchaseResource } from "../lib/purchase.interface";
import { DataTable } from "@/components/DataTable";

interface PurchaseTableProps {
  data: PurchaseResource[];
  onEdit: (purchase: PurchaseResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (purchase: PurchaseResource) => void;
  onManage: (purchase: PurchaseResource) => void;
  onQuickPay: (purchase: PurchaseResource) => void;
  isLoading: boolean;
  children?: React.ReactNode;
}

export const PurchaseTable = ({
  data,
  onEdit,
  onDelete,
  onViewDetails,
  onManage,
  onQuickPay,
  isLoading,
  children,
}: PurchaseTableProps) => {
  const columns = getPurchaseColumns({
    onEdit,
    onDelete,
    onViewDetails,
    onManage,
    onQuickPay,
  });

  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
};
