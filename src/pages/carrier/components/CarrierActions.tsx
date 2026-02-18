"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CARRIER } from "../lib/carrier.interface";

export default function CarrierActions() {
  const { MODEL, ROUTE_ADD } = CARRIER;
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={() => navigate(ROUTE_ADD)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
