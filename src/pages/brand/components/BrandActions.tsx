"use client";

import { Button } from "@/components/ui/button";
import BrandModal from "./BrandModal";
import { Plus } from "lucide-react";
import { BRAND } from "../lib/brand.interface";
import { useState } from "react";

export default function BrandActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = BRAND;
  return (
    <div className="flex items-center gap-2">
      <Button
        
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <BrandModal
        title={MODEL.name}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}