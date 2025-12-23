"use client";

import { Button } from "@/components/ui/button";
import CategoryModal from "./CategoryModal";
import { Plus } from "lucide-react";
import { CATEGORY } from "../lib/category.interface";
import { useState } from "react";

export default function CategoryActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = CATEGORY;
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <CategoryModal
        title={MODEL.name}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}