import { useQuery } from "@tanstack/react-query";
import { getUbigeos } from "./ubigeo.actions";

export function useUbigeosFrom(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["ubigeos", params],
    queryFn: () =>
      getUbigeos({
        params: {
          ...params,
          direction: "asc",
        },
      }),
  });
}

export function useUbigeosTo(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["ubigeos", params],
    queryFn: () =>
      getUbigeos({
        params: {
          ...params,
          direction: "asc",
        },
      }),
  });
}
