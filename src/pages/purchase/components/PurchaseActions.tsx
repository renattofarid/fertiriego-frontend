import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
}

export const PurchaseActions = ({ onCreatePurchase }: PurchaseActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onCreatePurchase}>
        <Plus className="mr-2 h-4 w-4" />
        Crear Compra
      </Button>
    </div>
  );
};
