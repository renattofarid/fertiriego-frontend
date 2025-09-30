"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WORKER } from "../lib/worker.interface";

interface WorkerActionsProps {
  onRefresh?: () => void;
}

export default function WorkerActions({ onRefresh }: WorkerActionsProps) {
  const { MODEL } = WORKER;
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate("/trabajadores/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}