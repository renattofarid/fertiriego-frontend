"use client";

import { Button } from "@/components/ui/button";
import { DRIVER } from "@/pages/driver/lib/driver.interface";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DriverActions() {
  const { MODEL } = DRIVER;
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate("/conductores/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
