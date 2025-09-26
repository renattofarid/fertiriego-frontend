"use client";

import { Button } from "@/components/ui/button";
import BoxModal from "./BoxModal";
import { Plus } from "lucide-react";
import { BOX } from "../lib/box.interface";
import { useState } from "react";

export default function BoxActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = BOX;
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <BoxModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}