"use client";

import { Button } from "@/components/ui/button";
import ScheduleModal from "./ScheduleModal";
import { Plus } from "lucide-react";
import { SCHEDULE } from "../lib/schedule.interface";
import { useState } from "react";

export default function ScheduleActions() {
  const [open, setOpen] = useState(false);
  const { MODEL } = SCHEDULE;

  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <ScheduleModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
