"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface IncomeActionsProps {
  onAdd: () => void;
}

export default function IncomeActions({ onAdd }: IncomeActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={onAdd}>
        <Plus className="size-4 mr-2" /> Registrar Ingreso
      </Button>
    </div>
  );
}
