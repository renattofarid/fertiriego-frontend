import { useQuery } from "@tanstack/react-query";
import { USER } from "./User.interface";
import { findUserById, getUser } from "./User.actions";

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
  return useQuery({
    queryKey: [USER.QUERY_KEY, id],
    queryFn: () => findUserById(id),
    enabled: !!id,
    retry: false,
  });
}
