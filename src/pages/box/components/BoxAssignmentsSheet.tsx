import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2 } from "lucide-react";
import {
  getUserBoxAssignmentsByBoxId,
  deleteUserBoxAssignment,
} from "@/pages/userboxassignment/lib/userboxassignment.actions";
import type { UserBoxAssignmentResource } from "@/pages/userboxassignment/lib/userboxassignment.interface";
import { Badge } from "@/components/ui/badge";
import UserBoxAssignmentModal from "@/pages/userboxassignment/components/UserBoxAssignmentModal";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { USERBOXASSIGNMENT } from "@/pages/userboxassignment/lib/userboxassignment.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import GeneralSheet from "@/components/GeneralSheet";

interface BoxAssignmentsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boxId: number;
  boxName: string;
}

const { MODEL, ICON } = USERBOXASSIGNMENT;

export default function BoxAssignmentsSheet({
  open,
  onOpenChange,
  boxId,
  boxName,
}: BoxAssignmentsSheetProps) {
  const [assignments, setAssignments] = useState<UserBoxAssignmentResource[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await getUserBoxAssignmentsByBoxId(boxId);
      setAssignments(data);
    } catch (error) {
      console.error("Error loading assignments:", error);
      errorToast("Error al cargar las asignaciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && boxId) {
      fetchAssignments();
    }
  }, [open, boxId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUserBoxAssignment(deleteId);
      await fetchAssignments();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchAssignments();
  };

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={() => onOpenChange(false)}
        title={`Asignaciones de ${boxName}`}
        subtitle="Usuarios asignados a esta caja"
        icon={ICON}
      >
        <div className="space-y-4">
          <div className="w-full flex justify-end">
            <Button onClick={() => setShowAddModal(true)} className="w-fit">
              <Plus className="size-4 mr-2" />
              Asignar Usuario
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay usuarios asignados a esta caja</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{assignment.user_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          assignment.status === "Activo"
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {assignment.status === "Activo" ? "Activo" : "Inactivo"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(assignment.assigned_at).toLocaleDateString(
                          "es-PE",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    {assignment.ended_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Finalizado:{" "}
                        {new Date(assignment.ended_at).toLocaleDateString(
                          "es-PE",
                        )}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(assignment.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </GeneralSheet>

      {showAddModal && (
        <UserBoxAssignmentModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            handleAddSuccess();
          }}
          title="Asignar Usuario a Caja"
          mode="create"
          preselectedBoxId={boxId}
          preselectedBoxName={boxName}
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
