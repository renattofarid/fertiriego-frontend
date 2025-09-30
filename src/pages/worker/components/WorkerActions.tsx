"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WORKER } from "../lib/worker.interface";

export default function WorkerActions() {
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
