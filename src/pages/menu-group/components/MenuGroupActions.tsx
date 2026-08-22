"use client";

import { Button } from "@/components/ui/button";
import MenuGroupModal from "./MenuGroupModal";
import { Plus } from "lucide-react";
import { MENU_GROUP } from "../lib/menuGroup.interface";
import { useState } from "react";

export default function MenuGroupActions() {
  const [open, setOpen] = useState(false);

  const { MODEL, TITLES } = MENU_GROUP;
  return (
    <div className="flex items-center gap-2">
      <Button className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      {open && (
        <MenuGroupModal
          open={open}
          onClose={() => setOpen(false)}
          title={TITLES.create.title}
          mode="create"
        />
      )}
    </div>
  );
}
