"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Check, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralModal } from "@/components/GeneralModal";
import { PersonAddressForm, type AddressFormValues } from "@/pages/person/components/PersonAddressForm";
import { getAddresses, createAddress } from "@/pages/person/lib/person.address.actions";
import type { AddressResource } from "@/pages/person/lib/person.address.interface";
import { errorToast, successToast } from "@/lib/core.function";

interface AddressPickerFieldProps {
  personId?: number | null;
  value?: string;
  onChange: (addressId: string, address: AddressResource) => void;
  label: string;
  personLabel?: string;
  disabled?: boolean;
}

export function AddressPickerField({
  personId,
  value,
  onChange,
  label,
  personLabel = "persona",
  disabled = false,
}: AddressPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState<AddressResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const selectedAddress = addresses.find((a) => a.id.toString() === value);

  const loadAddresses = async (autoSelect = false) => {
    if (!personId) return;
    setLoading(true);
    try {
      const response = await getAddresses(personId);
      setAddresses(response.data);

      if (autoSelect) {
        const defaultAddr = response.data.find((a) => a.is_default);
        if (defaultAddr) {
          onChange(defaultAddr.id.toString(), defaultAddr);
        } else if (response.data.length === 0) {
          // No addresses: open modal directly with add form
          setShowAddForm(true);
          setOpen(true);
        }
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personId) {
      loadAddresses(true);
    } else {
      setAddresses([]);
    }
  }, [personId]);

  const handleOpen = () => {
    setShowAddForm(addresses.length === 0);
    setOpen(true);
  };

  const handleSelect = (address: AddressResource) => {
    onChange(address.id.toString(), address);
    setOpen(false);
  };

  const handleCreateAddress = async (data: AddressFormValues) => {
    if (!personId) return;
    setIsCreating(true);
    try {
      const created = await createAddress(personId, data);
      successToast("Dirección creada correctamente");
      await loadAddresses(false);
      onChange(created.data.id.toString(), created.data);
      setShowAddForm(false);
      setOpen(false);
    } catch {
      errorToast("Error al crear la dirección");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-left h-auto min-h-9 py-2 px-3"
        onClick={handleOpen}
        disabled={disabled || !personId || loading}
      >
        <MapPin className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
        {loading ? (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Loader className="h-3 w-3 animate-spin" /> Cargando...
          </span>
        ) : selectedAddress ? (
          <span className="flex flex-col min-w-0">
            <span className="truncate text-sm">{selectedAddress.direccion}</span>
            <span className="truncate text-xs text-muted-foreground">{selectedAddress.district.cadena}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {!personId ? `Seleccione primero un ${personLabel}` : "Seleccionar dirección"}
          </span>
        )}
      </Button>

      <GeneralModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Dirección de ${personLabel}`}
        subtitle="Seleccione o agregue una dirección"
        icon="MapPin"
        size="lg"
      >
        {!showAddForm ? (
          <div className="space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelect(addr)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border text-sm transition-colors hover:bg-muted",
                    value === addr.id.toString() && "border-primary bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{addr.direccion}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{addr.district.cadena}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 items-center">
                      {addr.is_default && (
                        <Badge variant="default" className="text-xs">Principal</Badge>
                      )}
                      {value === addr.id.toString() && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar nueva dirección
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                ← Volver a la lista
              </Button>
            )}
            <PersonAddressForm
              onSubmit={handleCreateAddress}
              onCancel={addresses.length > 0 ? () => setShowAddForm(false) : undefined}
              isSubmitting={isCreating}
              submitLabel="Crear dirección"
            />
          </div>
        )}
      </GeneralModal>
    </div>
  );
}
