"use client";

import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface PayrollActionsProps {
  onCalculate: () => void;
}

export default function PayrollActions({ onCalculate }: PayrollActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={onCalculate}>
        <Calculator className="size-4 mr-2" /> Calcular Planilla
      </Button>
    </div>
  );
}
