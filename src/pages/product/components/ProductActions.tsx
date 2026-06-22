"use client";

import { Button } from "@/components/ui/button";
import { Plus, Tags } from "lucide-react";
import { PRODUCT } from "../lib/product.interface";

interface ProductActionsProps {
  onCreateProduct: () => void;
  selectedCount?: number;
  onAssignClassification?: () => void;
}

export default function ProductActions({
  onCreateProduct,
  selectedCount = 0,
  onAssignClassification,
}: ProductActionsProps) {
  const { MODEL } = PRODUCT;

  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <Button variant="outline" onClick={onAssignClassification}>
          <Tags className="size-4 mr-2" />
          Asignar Clasificación ({selectedCount})
        </Button>
      )}
      <Button className="ml-auto" onClick={onCreateProduct}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}