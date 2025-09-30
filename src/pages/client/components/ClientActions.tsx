"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PersonModal from "@/pages/person/components/PersonModal";
import { CLIENT, CLIENT_ROLE_ID } from "../lib/client.interface";

interface ClientActionsProps {
  onRefresh?: () => void;
}

export default function ClientActions({ onRefresh }: ClientActionsProps) {
  const { MODEL } = CLIENT;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="ml-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
        </Button>
      </div>

      <PersonModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={onRefresh}
        roleId={CLIENT_ROLE_ID}
        title={MODEL.name}
      />
    </>
  );
}
