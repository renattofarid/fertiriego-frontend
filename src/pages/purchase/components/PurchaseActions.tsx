import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
}

export const PurchaseActions = ({ onCreatePurchase }: PurchaseActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <ExportButtons
        excelEndpoint="/purchase/export"
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
