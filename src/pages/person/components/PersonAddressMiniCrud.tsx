import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useUbigeosFrom } from "@/pages/guide/lib/ubigeo.hook";
import { GeneralModal } from "@/components/GeneralModal";
import { PersonAddressForm, type AddressFormValues } from "./PersonAddressForm";
import type { PendingAddress } from "../lib/person.address.interface";

interface PersonAddressMiniCrudProps {
  onChange: (addresses: PendingAddress[]) => void;
}

export function PersonAddressMiniCrud({
  onChange,
}: PersonAddressMiniCrudProps) {
  const [addresses, setAddresses] = useState<PendingAddress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: ubigeos } = useUbigeosFrom();

  const getDistrictLabel = (districtId: number): string => {
    const found = ubigeos?.data?.find((u) => u.id === districtId);
    return found ? found.cadena : `Distrito #${districtId}`;
  };

  const updateAddresses = (newAddresses: PendingAddress[]) => {
    setAddresses(newAddresses);
    onChange(newAddresses);
  };

  const handleAdd = (data: AddressFormValues) => {
    const isFirst = addresses.length === 0;
    const newAddress: PendingAddress = {
      direccion: data.direccion,
      district_id: data.district_id,
      district_label: getDistrictLabel(data.district_id),
      is_default: isFirst || data.is_default,
    };

    let updated: PendingAddress[];
    if (newAddress.is_default) {
      updated = [
        ...addresses.map((a) => ({ ...a, is_default: false })),
        newAddress,
      ];
    } else {
      updated = [...addresses, newAddress];
    }

    updateAddresses(updated);
    setModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const wasDefault = addresses[index].is_default;
    const updated = addresses.filter((_, i) => i !== index);
    if (wasDefault && updated.length > 0) {
      updated[0] = { ...updated[0], is_default: true };
    }
    updateAddresses(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Agregar dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-3">
          No hay direcciones registradas (opcional)
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left py-2 pr-4 font-medium">Dirección</th>
                <th className="text-left py-2 pr-4 font-medium">Distrito</th>
                <th className="text-center py-2 pr-4 font-medium">Principal</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {addresses.map((addr, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2 pr-4 max-w-[200px]">
                    <span className="truncate block">{addr.direccion}</span>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground max-w-[200px]">
                    <span className="truncate block">
                      {addr.district_label ?? `Distrito #${addr.district_id}`}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-center">
                    {addr.is_default && (
                      <Badge variant="default" className="text-xs">
                        Principal
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GeneralModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Agregar dirección"
        subtitle="Completa los datos de la nueva dirección"
        icon="MapPin"
        size="lg"
      >
        <PersonAddressForm
          onSubmit={handleAdd}
          onCancel={() => setModalOpen(false)}
          submitLabel="Agregar"
        />
      </GeneralModal>
    </div>
  );
}
