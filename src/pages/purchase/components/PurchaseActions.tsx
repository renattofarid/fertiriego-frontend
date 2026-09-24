import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
  search?: string;
  status?: string;
  paymentType?: string;
  supplierId?: string;
}

export const PurchaseActions = ({
  onCreatePurchase,
  search,
  status,
  paymentType,
  supplierId,
}: PurchaseActionsProps) => {
  const excelParams = new URLSearchParams();
  if (search) excelParams.append("search", search);
  if (status) excelParams.append("status", status);
  if (paymentType) excelParams.append("payment_type", paymentType);
  if (supplierId) excelParams.append("supplier_id", supplierId);

  const excelQuery = excelParams.toString();
  const excelEndpoint = `/purchase/export${excelQuery ? `?${excelQuery}` : ""}`;

  return (
    <div className="flex items-center gap-2">
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName="compras.xlsx"
        variant="grouped"
      />
      <Button  onClick={onCreatePurchase}>
        <Plus className="mr-2 h-4 w-4" />
        Crear Compra
      </Button>
    </div>
  );
};
