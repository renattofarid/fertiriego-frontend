"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { USER } from "../lib/User.interface";
import { useState } from "react";
import UserModal from "./UserModal";

export default function UserActions() {
  const [open, setOpen] = useState(false);
  const { MODEL } = USER;
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <UserModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
