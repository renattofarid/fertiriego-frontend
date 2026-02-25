import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTypeUserStore } from "./typeUsers.store";
import { getTypeUser } from "./typeUser.actions";
import { TYPE_USER } from "./typeUser.interface";

export function useTypeUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [TYPE_USER.QUERY_KEY, params],
    queryFn: () =>
      getTypeUser({
        params: {
          ...params,
        },
      }),
  });
}

export function useTypeUser(id: number) {
  const { typeUser, isFinding, error, fetchTypeUser } = useTypeUserStore();

  useEffect(() => {
    fetchTypeUser(id);
  }, [id]);

  return {
    data: typeUser,
    isFinding,
    error,
    refetch: () => fetchTypeUser(id),
  };
}
