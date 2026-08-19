"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PRODUCT_TAG } from "../lib/product-tag.interface";
import { useState } from "react";
import TagModal from "./TagModal";

export default function TagActions() {
  const [open, setOpen] = useState(false);
  const { MODEL } = PRODUCT_TAG;

  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <TagModal
        title={MODEL.name}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
