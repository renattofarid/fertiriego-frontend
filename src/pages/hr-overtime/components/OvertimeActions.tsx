"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import OvertimeDetectModal from "./OvertimeDetectModal";

export default function OvertimeActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => setOpen(true)}>
        <Calculator className="size-4 mr-2" /> Calcular Horas Extras
      </Button>
      <OvertimeDetectModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
