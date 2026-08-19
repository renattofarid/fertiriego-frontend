"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PRODUCT } from "../lib/product.interface";

interface ProductActionsProps {
  onCreateProduct: () => void;
}

export default function ProductActions({ onCreateProduct }: ProductActionsProps) {
  const { MODEL } = PRODUCT;

  return (
    <div className="flex items-center gap-2">
      <Button
        
        className="ml-auto"
        onClick={onCreateProduct}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}