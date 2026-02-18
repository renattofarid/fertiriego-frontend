"use client";

import { Button } from "@/components/ui/button";
import WarehouseModal from "./WarehouseModal";
import { Plus } from "lucide-react";
import { WAREHOUSE } from "../lib/warehouse.interface";
import { useState } from "react";

export default function WarehouseActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = WAREHOUSE;
  return (
    <div className="flex items-center gap-2">
      <Button
        
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <WarehouseModal
        title={MODEL.name}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}