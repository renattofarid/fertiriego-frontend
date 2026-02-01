import { useQuery } from "@tanstack/react-query";
import { getPersons } from "@/pages/person/lib/person.actions";
import { CLIENT, CLIENT_ROLE_CODE } from "./client.interface";

export function useClients(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [CLIENT.QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          ...params,
          role_names: [CLIENT_ROLE_CODE],
        },
      }),
  });
}
