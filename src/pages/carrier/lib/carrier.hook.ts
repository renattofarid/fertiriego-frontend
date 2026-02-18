import { useQuery } from "@tanstack/react-query";
import { getPersons } from "@/pages/person/lib/person.actions";
import { CARRIER, CARRIER_ROLE_CODE } from "./carrier.interface";

export function useCarriers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [CARRIER.QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          direction: "asc",
          role_names: [CARRIER_ROLE_CODE],
          ...params,
        },
      }),
  });
}
