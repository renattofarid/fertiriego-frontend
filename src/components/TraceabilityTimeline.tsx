"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Activity, Loader } from "lucide-react";
import type {
  TraceabilityEntityType,
  TraceabilityEvent,
} from "@/lib/traceability/traceability.interface";
import { getTraceability } from "@/lib/traceability/traceability.actions";
import { errorToast } from "@/lib/core.function";

interface TraceabilityTimelineProps {
  entityType: TraceabilityEntityType;
  entityId: number;
}

export default function TraceabilityTimeline({
  entityType,
  entityId,
}: TraceabilityTimelineProps) {
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraceability = async () => {
      setIsLoading(true);
      try {
        const response = await getTraceability(entityType, entityId);
        setEvents(response.data || []);
      } catch (error) {
        console.error("Error al cargar trazabilidad", error);
        errorToast("Error al cargar la trazabilidad");
      } finally {
        setIsLoading(false);
      }
    };

    if (entityId) {
      fetchTraceability();
    }
  }, [entityType, entityId]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeColor = (
    eventType: string
  ): "secondary" | "outline" | "destructive" | "default" | "green" => {
    const type = eventType.toLowerCase();
    if (type.includes("create") || type.includes("creado")) return "default";
    if (type.includes("update") || type.includes("actualizado"))
      return "secondary";
    if (type.includes("delete") || type.includes("eliminado"))
      return "destructive";
    if (type.includes("approve") || type.includes("aprobado")) return "green";
    return "outline";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trazabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trazabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay eventos de trazabilidad disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Trazabilidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative flex gap-4 pb-4 border-l-2 border-muted pl-4 last:border-l-0 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />

              {/* Event content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant={getEventTypeColor(event.event_type)}
                      className="mb-2"
                    >
                      {event.event_type}
                    </Badge>
                    <p className="text-sm font-medium text-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* User and timestamp */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{event.user_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(event.occurred_at)}</span>
                  </div>
                </div>

                {/* Metadata if exists */}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                    <details>
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver detalles
                      </summary>
                      <div className="mt-2 space-y-1">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium">{key}:</span>
                            <span className="text-muted-foreground">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
