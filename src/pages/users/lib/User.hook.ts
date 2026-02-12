// hooks/useUsers.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "./Users.store";
import { USER } from "./User.interface";
import { getUser } from "./User.actions";

export function useUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [USER.QUERY_KEY, params],
    queryFn: () =>
      getUser({
        params: {
          ...params,
        },
      }),
  });
}

export function useUser(id: number) {
  const { User, isFinding, error, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser(id);
  }, [id]);

  return {
    data: User,
    isFinding,
    error,
    refetch: () => fetchUser(id),
  };
}
