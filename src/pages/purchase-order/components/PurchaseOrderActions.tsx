import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  onCreatePurchaseOrder: () => void;
}

export default function PurchaseOrderActions({ onCreatePurchaseOrder }: Props) {
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onCreatePurchaseOrder}>
        <Plus className="mr-2 h-4 w-4" />
        Crear Orden de Compra
      </Button>
    </div>
  );
}
