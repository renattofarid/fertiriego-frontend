import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AttendanceStatus } from "../lib/attendance.interface";

const STATUS_LEGEND: {
  status: AttendanceStatus;
  label: string;
  variant: "green" | "yellow" | "red" | "blue" | "orange" | "gray";
  description: string;
}[] = [
  {
    status: "PRESENTE",
    label: "Presente",
    variant: "green",
    description:
      "El trabajador marcó entrada dentro del margen de tolerancia (ej. tolerancia 10 min → llega hasta 08:10 y es PRESENTE).",
  },
  {
    status: "TARDANZA",
    label: "Tardanza",
    variant: "yellow",
    description:
      "Marcó entrada pero superó los minutos de tolerancia configurados en el turno. Ej: turno 08:00, tolerancia 10 min, llegó 08:20 = TARDANZA.",
  },
  {
    status: "FALTA",
    label: "Falta",
    variant: "red",
    description:
      "No existe ninguna marcación de ENTRADA para ese día. Es el estado por defecto hasta que marque.",
  },
  {
    status: "JUSTIFICADO",
    label: "Justificado",
    variant: "blue",
    description:
      "Existe una justificación APROBADA que cubre esa fecha (permiso, vacaciones, enfermedad). Tiene prioridad sobre todo.",
  },
  {
    status: "MEDIO_DIA",
    label: "Medio Día",
    variant: "orange",
    description:
      "Marcó entrada pero los minutos trabajados (entre entrada y salida) son menos de la mitad del mínimo configurado en el turno. Ej: turno con min_hours=8 → trabajó menos de 4h = MEDIO_DIA. Aplica también cuando solo hay marcación de entrada sin salida y han pasado pocas horas.",
  },
  {
    status: "DESCANSO",
    label: "Descanso",
    variant: "gray",
    description:
      "Día libre, feriado o día de descanso programado. Se asigna manualmente o puede extenderse en el futuro desde un calendario de feriados.",
  },
];

export default function AttendanceStatusLegendDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Leyenda de estados">
          <Info className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Leyenda de estados de asistencia</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {STATUS_LEGEND.map(({ status, label, variant, description }) => (
            <div key={status} className="flex items-start gap-3">
              <Badge variant={variant} className="mt-0.5 shrink-0">
                {label}
              </Badge>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
