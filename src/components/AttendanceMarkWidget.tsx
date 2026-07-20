import { useState } from "react";
import { format } from "date-fns";
import { Clock3, LogIn, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useAttendanceLogs } from "@/pages/hr-attendance/lib/attendance.hook";
import { storeAttendanceLog } from "@/pages/hr-attendance/lib/attendance.actions";
import { successToast, errorToast } from "@/lib/core.function";
import type { AttendanceType } from "@/pages/hr-attendance/lib/attendance.interface";

export function AttendanceMarkWidget() {
  const { user } = useAuthStore();
  const [loadingType, setLoadingType] = useState<AttendanceType | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  const { data, refetch } = useAttendanceLogs(
    user?.person_id
      ? {
          person_id: user.person_id,
          date_from: today,
          date_until: today,
          per_page: 20,
        }
      : undefined,
  );

  if (!user) return null;

  const todayLogs = data?.data ?? [];

  const handleMark = async (type: AttendanceType) => {
    setLoadingType(type);
    try {
      const now = new Date();
      await storeAttendanceLog({
        person_id: user.person_id,
        type,
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm:ss"),
        method: "DIGITAL",
        device_reference: "LAPTOP",
        notes: "Marcación registrada desde el sistema web",
      });
      successToast(
        type === "ENTRADA" ? "Entrada registrada" : "Salida registrada",
      );
      refetch();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al registrar la marcación.",
      );
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Marcar asistencia"
        >
          <Clock3 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm">Marcar Asistencia</h3>
            <p className="text-xs text-muted-foreground">
              {user.person?.full_name ?? user.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              color="green"
              className="flex-col h-16 gap-1"
              disabled={loadingType !== null}
              onClick={() => handleMark("ENTRADA")}
            >
              <LogIn className="size-4" />
              {loadingType === "ENTRADA" ? "Marcando..." : "Entrada"}
            </Button>
            <Button
              type="button"
              variant="outline"
              color="red"
              className="flex-col h-16 gap-1"
              disabled={loadingType !== null}
              onClick={() => handleMark("SALIDA")}
            >
              <LogOut className="size-4" />
              {loadingType === "SALIDA" ? "Marcando..." : "Salida"}
            </Button>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Marcaciones de hoy
            </p>
            {todayLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aún no registras marcaciones hoy.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <Badge variant={log.type === "ENTRADA" ? "green" : "blue"}>
                      {log.type}
                    </Badge>
                    <span className="text-muted-foreground">
                      {log.time?.slice(0, 8)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
