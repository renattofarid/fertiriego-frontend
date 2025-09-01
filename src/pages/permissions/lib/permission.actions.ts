import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type {
  getOptionMenuProps,
  OptionMenuResource,
  OptionMenuResponse,
} from "./permission.interface";

const ENDPOINT = "/option-menu";

export async function getOptionsMenu({
  params,
}: getOptionMenuProps): Promise<OptionMenuResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<OptionMenuResponse>(ENDPOINT, config);
  return data;
}

export async function updateOptionMenu(
  id: number,
  data: any
): Promise<OptionMenuResource> {
  const response = await api.put<OptionMenuResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}
