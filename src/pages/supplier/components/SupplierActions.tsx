"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PersonModal from "@/pages/person/components/PersonModal";
import { SUPPLIER, SUPPLIER_ROLE_ID } from "../lib/supplier.interface";

interface SupplierActionsProps {
  onRefresh?: () => void;
}

export default function SupplierActions({ onRefresh }: SupplierActionsProps) {
  const { MODEL } = SUPPLIER;
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
        roleId={SUPPLIER_ROLE_ID}
        title={MODEL.name}
      />
    </>
  );
}