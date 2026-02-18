import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BoxShiftOpenModal from "./BoxShiftOpenModal";

export default function BoxShiftActions() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button  onClick={() => setOpenModal(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Abrir Turno
      </Button>

      <BoxShiftOpenModal
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={() => {
          setOpenModal(false);
          window.location.reload();
        }}
      />
    </>
  );
}
