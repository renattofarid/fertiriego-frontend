import { api } from "@/lib/config";
import type { UbigeoResponse } from "./ubigeo.interface";
import { UBIGEO_ENDPOINT } from "./ubigeo.interface";

export const searchUbigeos = async (
  cadena?: string,
  perPage: number = 15
): Promise<UbigeoResponse> => {
  const response = await api.get<UbigeoResponse>(UBIGEO_ENDPOINT, {
    params: {
      per_page: perPage,
      ...(cadena && { cadena }),
    },
  });
  return response.data;
};
