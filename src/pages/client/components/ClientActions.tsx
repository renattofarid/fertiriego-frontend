"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CLIENT } from "../lib/client.interface";

interface ClientActionsProps {
  onRefresh?: () => void;
}

export default function ClientActions({ onRefresh }: ClientActionsProps) {
  const { MODEL } = CLIENT;
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate("/clientes/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
