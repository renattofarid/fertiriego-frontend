import { useEffect, useState } from "react";
import { api } from "@/lib/config";

export interface ExpiringInstallment {
  id: number;
  correlativo: string;
  purchase_id: number;
  purchase_correlativo: string;
  installment_number: number;
  due_days: number;
  due_date: string;
  amount: string;
  pending_amount: string;
  status: string;
  created_at: string;
}

interface NotificationsResponse {
  data: ExpiringInstallment[];
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<ExpiringInstallment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<NotificationsResponse>(
        "purchase-installments/expiring-alert"
      );
      setNotifications(response.data.data);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications,
    count: notifications.length,
  };
};
