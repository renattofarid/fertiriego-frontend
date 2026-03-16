import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/components/GeneralSheet";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleDeleteDialog, DeleteButton } from "@/components/SimpleDeleteDialog";
import { ButtonAction } from "@/components/ButtonAction";
import {
  MapPin,
  Plus,
  Pencil,
  Star,
  Loader,
} from "lucide-react";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../lib/person.address.actions";
import type { AddressResource } from "../lib/person.address.interface";
import { PersonAddressForm, type AddressFormValues } from "./PersonAddressForm";
import { errorToast, successToast } from "@/lib/core.function";

interface PersonAddressSheetProps {
  personId: number;
  personName: string;
  open: boolean;
  onClose: () => void;
}

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; address: AddressResource }
  | { type: "delete"; address: AddressResource };

export function PersonAddressSheet({
  personId,
  personName,
  open,
  onClose,
}: PersonAddressSheetProps) {
  const queryClient = useQueryClient();
  const queryKey = ["person-addresses", personId];

  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getAddresses(personId, { per_page: 50 }),
    enabled: open,
  });

  const addresses = data?.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: (values: AddressFormValues) =>
      createAddress(personId, {
        direccion: values.direccion,
        district_id: values.district_id,
        is_default: values.is_default,
      }),
    onSuccess: () => {
      successToast("Dirección creada correctamente");
      invalidate();
      setModal({ type: "none" });
    },
    onError: (err: any) => {
      errorToast(
        err?.response?.data?.message ?? "Error al crear la dirección",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      addressId,
      values,
    }: {
      addressId: number;
      values: AddressFormValues;
    }) =>
      updateAddress(personId, addressId, {
        direccion: values.direccion,
        district_id: values.district_id,
        is_default: values.is_default,
      }),
    onSuccess: () => {
      successToast("Dirección actualizada correctamente");
      invalidate();
      setModal({ type: "none" });
    },
    onError: (err: any) => {
      errorToast(
        err?.response?.data?.message ?? "Error al actualizar la dirección",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (addressId: number) => deleteAddress(personId, addressId),
    onSuccess: () => {
      successToast("Dirección eliminada correctamente");
      invalidate();
    },
    onError: (err: any) => {
      errorToast(
        err?.response?.data?.message ?? "Error al eliminar la dirección",
      );
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (addressId: number) => setDefaultAddress(personId, addressId),
    onSuccess: () => {
      successToast("Dirección principal actualizada");
      invalidate();
    },
    onError: (err: any) => {
      errorToast(
        err?.response?.data?.message ?? "Error al establecer dirección principal",
      );
    },
  });

  const handleCreateSubmit = async (values: AddressFormValues) => {
    await createMutation.mutateAsync(values);
  };

  const handleEditSubmit = async (values: AddressFormValues) => {
    if (modal.type !== "edit") return;
    await updateMutation.mutateAsync({ addressId: modal.address.id, values });
  };

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title="Direcciones"
        subtitle={personName}
        icon="MapPin"
        size="xl"
      >
        <div className="space-y-4 py-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setModal({ type: "create" })}
            >
              <Plus className="h-4 w-4" />
              Agregar dirección
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No hay direcciones registradas
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start gap-3 p-3 rounded-md border bg-card"
                >
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{addr.direccion}</p>
                    <p className="text-xs text-muted-foreground">
                      {addr.district.cadena}
                    </p>
                    {addr.is_default && (
                      <Badge variant="default" className="text-xs mt-1">
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!addr.is_default && (
                      <ButtonAction
                        icon={Star}
                        tooltip="Establecer como principal"
                        onClick={() => defaultMutation.mutate(addr.id)}
                        disabled={defaultMutation.isPending}
                      />
                    )}
                    <ButtonAction
                      icon={Pencil}
                      tooltip="Editar"
                      onClick={() => setModal({ type: "edit", address: addr })}
                    />
                    <DeleteButton
                      onClick={() =>
                        setModal({ type: "delete", address: addr })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GeneralSheet>

      {/* Create modal */}
      <GeneralModal
        open={modal.type === "create"}
        onClose={() => setModal({ type: "none" })}
        title="Agregar dirección"
        subtitle="Completa los datos de la nueva dirección"
        icon="MapPin"
        size="lg"
      >
        <PersonAddressForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setModal({ type: "none" })}
          isSubmitting={createMutation.isPending}
          submitLabel="Agregar"
        />
      </GeneralModal>

      {/* Edit modal */}
      {modal.type === "edit" && (
        <GeneralModal
          open
          onClose={() => setModal({ type: "none" })}
          title="Editar dirección"
          subtitle="Modifica los datos de la dirección"
          icon="MapPin"
          size="lg"
        >
          <PersonAddressForm
            initialData={{
              direccion: modal.address.direccion,
              district_id: modal.address.district.id,
              is_default: modal.address.is_default,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setModal({ type: "none" })}
            isSubmitting={updateMutation.isPending}
            submitLabel="Actualizar"
          />
        </GeneralModal>
      )}

      {/* Delete confirmation */}
      {modal.type === "delete" && (
        <SimpleDeleteDialog
          open
          onOpenChange={(v) => !v && setModal({ type: "none" })}
          title="Eliminar dirección"
          description={`¿Estás seguro de que deseas eliminar la dirección "${modal.address.direccion}"?`}
          onConfirm={async () => { await deleteMutation.mutateAsync(modal.address.id); }}
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  );
}
