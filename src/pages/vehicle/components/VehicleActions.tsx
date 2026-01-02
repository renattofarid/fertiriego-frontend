import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import VehicleModal from "./VehicleModal";
import { VEHICLE } from "../lib/vehicle.interface";

const { TITLES } = VEHICLE;

export default function VehicleActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Vehículo
      </Button>

      {isCreateModalOpen && (
        <VehicleModal
          open={true}
          onClose={() => setIsCreateModalOpen(false)}
          title={TITLES.create.title}
          mode="create"
        />
      )}
    </>
  );
}
