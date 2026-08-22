"use client";

import { Button } from "@/components/ui/button";
import PermissionModal from "./PermissionModal";
import { Plus } from "lucide-react";
import { PERMISSION } from "../lib/permission.interface";
import { useState } from "react";

export default function PermissionActions() {
  const [open, setOpen] = useState(false);

  const { MODEL, TITLES } = PERMISSION;
  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      {open && (
        <PermissionModal
          open={open}
          onClose={() => setOpen(false)}
          title={TITLES.create.title}
          mode="create"
        />
      )}
    </div>
  );
}
