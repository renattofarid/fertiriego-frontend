import { getPurchaseShippingGuideColumns } from "./PurchaseShippingGuideColumns";
import type { PurchaseShippingGuideResource } from "../lib/purchase-shipping-guide.interface";
import { DataTable } from "@/components/DataTable";

interface PurchaseShippingGuideTableProps {
  data: PurchaseShippingGuideResource[];
  onEdit: (guide: PurchaseShippingGuideResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (guide: PurchaseShippingGuideResource) => void;
  onAssignPurchase: (guide: PurchaseShippingGuideResource) => void;
  isLoading: boolean;
  children?: React.ReactNode;
}

export const PurchaseShippingGuideTable = ({
  data,
  onEdit,
  onDelete,
  onViewDetails,
  onAssignPurchase,
  isLoading,
  children,
}: PurchaseShippingGuideTableProps) => {
  const columns = getPurchaseShippingGuideColumns({ onEdit, onDelete, onViewDetails, onAssignPurchase });

  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
};
