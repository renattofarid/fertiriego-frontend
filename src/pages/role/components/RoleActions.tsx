"use client";

import { Button } from "@/components/ui/button";
import RoleModal from "./RoleModal";
import { Plus } from "lucide-react";
import { ROLE } from "../lib/role.interface";
import { useState } from "react";

export default function RoleActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = ROLE;
  return (
    <div className="flex items-center gap-2">
      <Button
        
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <RoleModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => setOpen(false)}
      />
    </div>
  );
}