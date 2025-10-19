import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PurchaseShippingGuideActionsProps {
  onCreateGuide: () => void;
}

export const PurchaseShippingGuideActions = ({
  onCreateGuide,
}: PurchaseShippingGuideActionsProps) => {
  return (
    <Button onClick={onCreateGuide}>
      <Plus className="mr-2 h-4 w-4" />
      Nueva Guía
    </Button>
  );
};
