import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { updatePerson } from "../lib/person.actions";
import { errorToast, successToast } from "@/lib/core.function";
import type { PersonResource } from "../lib/person.interface";

interface PersonAddressModalProps {
  person: PersonResource;
  open: boolean;
  onClose: () => void;
  onSuccess: (newAddress: string) => void;

export function PersonAddressModal({
  person,
  open,
  onClose,
  onSuccess,
}: PersonAddressModalProps) {
  const [address, setAddress] = useState(person.address ?? "");

  const mutation = useMutation({
    mutationFn: (value: string) => updatePerson(person.id, { address: value }),
    onSuccess: (_, value) => {
      successToast("Dirección actualizada correctamente");
      onSuccess(value);
      onClose();
    },
    onError: (err: any) => {
      errorToast(err?.response?.data?.message ?? "Error al actualizar la dirección");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mutation.mutate(address);
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Actualizar dirección"
      subtitle={person.business_name ?? `${person.names} ${person.father_surname}`.trim()}
      icon="MapPin"
      size="md"
      mode="edit"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            placeholder="Ingrese la dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar
          </Button>
        </div>
      </form>
    </GeneralModal>
  );
}
