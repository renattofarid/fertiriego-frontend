"use client";

import { Button } from "@/components/ui/button";
import BranchModal from "./BranchModal";
import { Plus } from "lucide-react";
import { BRANCH } from "../lib/branch.interface";
import { useState } from "react";

export default function BranchActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = BRANCH;
  return (
    <div className="flex items-center gap-2">
      <Button
        
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <BranchModal
        title={MODEL.name}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}