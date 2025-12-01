import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Shield,
  Plus,
  Minus,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAllRoles } from "@/pages/role/lib/role.hook";
import { usePersonRoleDetails } from "../lib/person.hook";
import { usePersonStore } from "../lib/person.store";
import { successToast, errorToast } from "@/lib/core.function";
import { GeneralModal } from "@/components/GeneralModal";
import type { PersonRoleAssignment } from "../lib/person.interface";

interface PersonRoleAssignmentProps {
  personId: number;
  personName: string;
  open: boolean;
  onClose: () => void;
}

export function PersonRoleAssignment({
  personId,
  personName,
  open,
  onClose,
}: PersonRoleAssignmentProps) {
  const [selectedRoles, setSelectedRoles] = useState<PersonRoleAssignment[]>(
    []
  );
  const [hasChanges, setHasChanges] = useState(false);

  const allRoles = useAllRoles();
  const { data: currentRoleDetails, refetch: refetchPersonRoleDetails } =
    usePersonRoleDetails(personId);
  const { updatePersonRoles, isSubmitting } = usePersonStore();

  // Initialize selected roles when data loads
  useEffect(() => {
    if (allRoles && currentRoleDetails) {
      const initialRoles: PersonRoleAssignment[] = allRoles.map((role) => {
        const existingRole = currentRoleDetails.find(
          (pr) => pr.role_id === role.id
        );
        return {
          role_id: role.id,
          status: !!existingRole, // If the role exists in currentRoleDetails, it's active
        };
      });
      setSelectedRoles(initialRoles);
    }
  }, [allRoles, currentRoleDetails]);

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    // Si está intentando desmarcar un rol, verificar que no sea el último
    if (!checked) {
      const currentActiveRoles = selectedRoles.filter((role) => role.status);
      if (
        currentActiveRoles.length === 1 &&
        currentActiveRoles[0].role_id === roleId
      ) {
        errorToast("Una persona debe tener al menos un rol asignado");
        return;
      }
    }

    setSelectedRoles((prev) =>
      prev.map((role) =>
        role.role_id === roleId ? { ...role, status: checked } : role
      )
    );
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    // Validar que haya al menos un rol activo
    const activeSelectedRoles = selectedRoles.filter((role) => role.status);
    if (activeSelectedRoles.length === 0) {
      errorToast("Una persona debe tener al menos un rol asignado");
      return;
    }

    try {
      await updatePersonRoles(personId, { roles: selectedRoles });
      successToast("Roles actualizados exitosamente");
      refetchPersonRoleDetails();
      setHasChanges(false);
      onClose();
    } catch (error: any) {
      const errorMessage =
           (error.response.data.message ?? error.response.data.error) ??
           "Error al actualizar los roles";
      errorToast(errorMessage);
    }
  };

  const handleReset = () => {
    if (allRoles && currentRoleDetails) {
      const resetRoles: PersonRoleAssignment[] = allRoles.map((role) => {
        const existingRole = currentRoleDetails.find(
          (pr) => pr.role_id === role.id
        );
        return {
          role_id: role.id,
          status: !!existingRole,
        };
      });
      setSelectedRoles(resetRoles);
      setHasChanges(false);
    }
  };

  const activeRoles = selectedRoles.filter((role) => role.status);
  const inactiveRoles = selectedRoles.filter((role) => !role.status);

  const getRoleName = (roleId: number) => {
    return (
      allRoles?.find((role) => role.id === roleId)?.name || `Rol ${roleId}`
    );
  };

  const getRoleCode = (roleId: number) => {
    return allRoles?.find((role) => role.id === roleId)?.code || "";
  };

  if (!allRoles || currentRoleDetails === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Asignación de Roles"
      subtitle={`Gestionar roles para ${personName}`}
      maxWidth="!max-w-6xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Roles Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {allRoles.map((role) => {
                    const isSelected =
                      selectedRoles.find((sr) => sr.role_id === role.id)
                        ?.status || false;

                    return (
                      <div
                        key={role.id}
                        className={`p-3 border rounded-lg transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleRoleToggle(role.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{role.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {role.code}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ID: {role.id}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRoleToggle(role.id, !isSelected)
                            }
                            className="gap-1"
                          >
                            {isSelected ? (
                              <>
                                <Minus className="h-4 w-4" />
                                Quitar
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Agregar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Role Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Asignación de Roles ({activeRoles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {activeRoles.length > 0 ? (
                  <div className="space-y-3">
                    {activeRoles.map((roleAssignment) => (
                      <div
                        key={roleAssignment.role_id}
                        className="p-3 border border-green-200 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <div>
                              <h4 className="font-medium">
                                {getRoleName(roleAssignment.role_id)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {getRoleCode(roleAssignment.role_id)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRoleToggle(roleAssignment.role_id, false)
                            }
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Carrito vacío
                    </h3>
                    <p className="text-muted-foreground">
                      Selecciona roles de la lista para agregar al carrito
                    </p>
                  </div>
                )}

                {inactiveRoles.length > 0 && activeRoles.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Roles Inactivos
                      </h4>
                      {inactiveRoles.map((roleAssignment) => (
                        <div
                          key={roleAssignment.role_id}
                          className="p-2 border border-gray-200 bg-gray-50 rounded text-sm opacity-60"
                        >
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-gray-500" />
                            <span>{getRoleName(roleAssignment.role_id)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Hay cambios sin guardar</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>

                {hasChanges && (
                  <Button variant="outline" onClick={handleReset}>
                    Restablecer
                  </Button>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !hasChanges}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Cambios ({activeRoles.length} roles)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GeneralModal>
  );
}
