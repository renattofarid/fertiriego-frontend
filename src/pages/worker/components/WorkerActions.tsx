"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PersonModal from "@/pages/person/components/PersonModal";
import { WORKER, WORKER_ROLE_ID } from "../lib/worker.interface";

interface WorkerActionsProps {
  onRefresh?: () => void;
}

export default function WorkerActions({ onRefresh }: WorkerActionsProps) {
  const { MODEL } = WORKER;
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
        roleId={WORKER_ROLE_ID}
        title={MODEL.name}
      />
    </>
  );
}