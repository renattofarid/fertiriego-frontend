"use client";

import { Button } from "@/components/ui/button";
import ProductPriceCategoryModal from "./ProductPriceCategoryModal";
import { Plus } from "lucide-react";
import { PRODUCT_PRICE_CATEGORY } from "../lib/product-price-category.interface";
import { useState } from "react";

export default function ProductPriceCategoryActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = PRODUCT_PRICE_CATEGORY;
  return (
    <div className="flex items-center gap-2">
      <Button  className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <ProductPriceCategoryModal
        title={MODEL.name}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
