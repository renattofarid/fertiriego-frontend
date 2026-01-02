import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductTypeActionsProps {
  onCreateProductType: () => void;
}

export default function ProductTypeActions({
  onCreateProductType,
}: ProductTypeActionsProps) {
  return (
    <div className="flex justify-end">
      <Button size="sm" onClick={onCreateProductType}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </div>
  );
}
