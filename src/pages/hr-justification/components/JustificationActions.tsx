"use client";

import { Button } from "@/components/ui/button";
import JustificationModal from "./JustificationModal";
import { Plus } from "lucide-react";
import { JUSTIFICATION_META } from "../lib/justification.interface";
import { useState } from "react";

export default function JustificationActions() {
  const [open, setOpen] = useState(false);
  const { MODEL } = JUSTIFICATION_META;

  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <JustificationModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
