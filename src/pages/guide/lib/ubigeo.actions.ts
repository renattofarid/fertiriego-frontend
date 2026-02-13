import { api } from "@/lib/config";
import type { UbigeoResponse } from "./ubigeo.interface";
import { UBIGEO_ENDPOINT } from "./ubigeo.interface";

interface Props {
  params?: Record<string, unknown>;
}

export const getUbigeos = async ({
  params,
}: Props): Promise<UbigeoResponse> => {
  const response = await api.get<UbigeoResponse>(UBIGEO_ENDPOINT, {
    params: {
      ...params,
    },
  });
  return response.data;
};
