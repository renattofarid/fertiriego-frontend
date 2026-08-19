"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, CalendarCog } from "lucide-react";
import VacationModal from "./VacationModal";
import { VACATION_CONTROL_ROUTE, VACATION_META } from "../lib/vacation.interface";

export default function VacationActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { MODEL } = VACATION_META;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => navigate(VACATION_CONTROL_ROUTE)}
      >
        <CalendarCog className="size-4 mr-2" /> Control de Vacaciones
      </Button>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <VacationModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
