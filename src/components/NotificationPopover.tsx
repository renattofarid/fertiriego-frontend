import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import formatCurrency from "@/lib/formatCurrency";

export function NotificationPopover() {
  const navigate = useNavigate();
  const { notifications, isLoading, count } = useNotifications();

  const handleNotificationClick = (purchaseId: number) => {
    navigate(`/compras/detalle/${purchaseId}`);
  };

  const getDaysColor = (days: number) => {
    if (days === 0) return "text-red-600 dark:text-red-400";
    if (days === 1) return "text-orange-600 dark:text-orange-400";
    if (days <= 3) return "text-yellow-600 dark:text-yellow-500";
    return "text-blue-600 dark:text-blue-400";
  };

  const getDaysBadgeVariant = (
    days: number
  ): "destructive" | "secondary" | "default" => {
    if (days === 0) return "destructive";
    if (days <= 3) return "secondary";
    return "default";
  };

  const getDaysText = (days: number) => {
    if (days === 0) return "Vence hoy";
    if (days === 1) return "Vence mañana";
    return `Vence en ${days} días`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-3">
          <h3 className="font-semibold text-base">Notificaciones</h3>
          {count > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {count}
            </Badge>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          ) : count === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                No hay notificaciones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Todas las cuotas están al día
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() =>
                    handleNotificationClick(notification.purchase_id)
                  }
                  className="w-full text-left p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">
                          {notification.purchase_correlativo}
                        </p>
                        <Badge
                          variant={getDaysBadgeVariant(notification.due_days)}
                          className="flex-shrink-0 text-xs"
                        >
                          {getDaysText(notification.due_days)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cuota #{notification.installment_number} -{" "}
                        {notification.correlativo}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Monto pendiente
                          </p>
                          <p className="text-sm font-semibold">
                            {formatCurrency(
                              parseFloat(notification.pending_amount)
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Vence</p>
                          <p
                            className={`text-xs font-medium ${getDaysColor(
                              notification.due_days
                            )}`}
                          >
                            {new Date(notification.due_date).toLocaleDateString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
