import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UnitModal from "./UnitModal";
import { UNIT } from "../lib/unit.interface";

const { TITLES } = UNIT;

export default function UnitActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Button  onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Unidad
      </Button>

      {isCreateModalOpen && (
        <UnitModal
          open={true}
          onClose={() => setIsCreateModalOpen(false)}
          title={TITLES.create.title}
          mode="create"
        />
      )}
    </>
  );
}
