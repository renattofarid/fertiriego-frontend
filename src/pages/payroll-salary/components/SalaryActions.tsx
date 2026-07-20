"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SalaryActionsProps {
  onAdd: () => void;
}

export default function SalaryActions({ onAdd }: SalaryActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={onAdd}>
        <Plus className="size-4 mr-2" /> Registrar Salario Base
      </Button>
    </div>
  );
}
